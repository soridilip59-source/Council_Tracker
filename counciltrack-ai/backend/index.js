require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/signup", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "insert into profiles(name,email,password_hash,role) values($1,$2,$3,'viewer') returning id,name,email,role",
    [name.trim(), email.trim().toLowerCase(), passwordHash]
  );
  res.status(201).json({ user: result.rows[0] });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("select * from profiles where email=$1", [email?.trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));

app.get("/api/categories", asyncHandler(async (_req, res) => {
  const result = await pool.query("select * from categories order by name");
  res.json(result.rows);
}));

app.post("/api/categories", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: "Category name is required" });
  const result = await pool.query("insert into categories(name) values($1) returning *", [req.body.name.trim()]);
  res.status(201).json(result.rows[0]);
}));

app.put("/api/categories/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const result = await pool.query("update categories set name=$1, updated_at=now() where id=$2 returning *", [req.body.name.trim(), req.params.id]);
  res.json(result.rows[0]);
}));

app.delete("/api/categories/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  await pool.query("delete from categories where id=$1", [req.params.id]);
  res.status(204).send();
}));

app.get("/api/councils", asyncHandler(async (_req, res) => {
  const result = await pool.query(`
    select c.*, cat.name as category,
      coalesce(json_agg(json_build_object('id',m.id,'name',m.name,'email',m.email,'profile',m.profile))
        filter (where m.id is not null),'[]') as members
    from councils c
    left join categories cat on cat.id=c.category_id
    left join council_members m on m.council_id=c.id
    where c.archived=false
    group by c.id,cat.name
    order by c.name
  `);
  res.json(result.rows);
}));

app.post("/api/councils", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const { name, categoryId, designation, description } = req.body;
  if (!name?.trim() || !designation?.trim()) return res.status(400).json({ error: "Name and designation are required" });
  const result = await pool.query(
    "insert into councils(name,category_id,designation,description) values($1,$2,$3,$4) returning *",
    [name.trim(), categoryId || null, designation.trim(), description?.trim() || ""]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/councils/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const { name, categoryId, designation, description } = req.body;
  const result = await pool.query(
    "update councils set name=$1,category_id=$2,designation=$3,description=$4,updated_at=now() where id=$5 returning *",
    [name.trim(), categoryId || null, designation.trim(), description?.trim() || "", req.params.id]
  );
  res.json(result.rows[0]);
}));

app.delete("/api/councils/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  await pool.query("update councils set archived=true,updated_at=now() where id=$1", [req.params.id]);
  res.status(204).send();
}));

app.post("/api/councils/:id/members", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const count = await pool.query("select count(*) from council_members where council_id=$1", [req.params.id]);
  if (Number(count.rows[0].count) >= 3) return res.status(400).json({ error: "A council can have maximum 3 members" });
  const { name, email, profile } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Member name is required" });
  const result = await pool.query(
    "insert into council_members(council_id,name,email,profile) values($1,$2,$3,$4) returning *",
    [req.params.id, name.trim(), email?.trim() || null, profile?.trim() || null]
  );
  res.status(201).json(result.rows[0]);
}));

app.delete("/api/councils/:councilId/members/:memberId", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  await pool.query("delete from council_members where id=$1 and council_id=$2", [req.params.memberId, req.params.councilId]);
  res.status(204).send();
}));

app.get("/api/goals", asyncHandler(async (_req, res) => {
  const result = await pool.query(`
    select g.*, c.name as council,
      coalesce(json_agg(json_build_object(
        'id',t.id,'title',t.title,'description',t.description,
        'priority',t.priority,'deadline',t.deadline,'status',t.status,
        'completedAt',t.completed_at,'assignedMemberId',t.assigned_member_id
      ) order by t.created_at) filter (where t.id is not null),'[]') as tasks
    from goals g
    join councils c on c.id=g.council_id
    left join tasks t on t.goal_id=g.id
    where g.archived=false
    group by g.id,c.name
    order by g.deadline
  `);
  res.json(result.rows);
}));

app.post("/api/goals", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const { councilId, title, description, startDate, deadline, period, status } = req.body;
  if (!councilId || !title?.trim() || !deadline) return res.status(400).json({ error: "Council, title and deadline are required" });
  const result = await pool.query(
    "insert into goals(council_id,title,description,start_date,deadline,period,status) values($1,$2,$3,$4,$5,$6,$7) returning *",
    [councilId, title.trim(), description?.trim() || "", startDate || null, deadline, period || null, status || "Not Started"]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/goals/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  const { councilId, title, description, startDate, deadline, period, status } = req.body;
  const result = await pool.query(
    "update goals set council_id=$1,title=$2,description=$3,start_date=$4,deadline=$5,period=$6,status=$7,updated_at=now() where id=$8 returning *",
    [councilId, title.trim(), description?.trim() || "", startDate || null, deadline, period || null, status, req.params.id]
  );
  res.json(result.rows[0]);
}));

app.delete("/api/goals/:id", authenticate, authorize("super_admin", "admin"), asyncHandler(async (req, res) => {
  await pool.query("update goals set archived=true,updated_at=now() where id=$1", [req.params.id]);
  res.status(204).send();
}));

app.post("/api/goals/:goalId/tasks", authenticate, asyncHandler(async (req, res) => {
  const { title, description, assignedMemberId, priority, deadline, status } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Task title is required" });
  const completedAt = status === "Completed" ? new Date() : null;
  const result = await pool.query(
    "insert into tasks(goal_id,title,description,assigned_member_id,priority,deadline,status,completed_at) values($1,$2,$3,$4,$5,$6,$7,$8) returning *",
    [req.params.goalId, title.trim(), description?.trim() || "", assignedMemberId || null, priority || "Medium", deadline || null, status || "Pending", completedAt]
  );
  res.status(201).json(result.rows[0]);
}));

app.put("/api/tasks/:id", authenticate, asyncHandler(async (req, res) => {
  const { title, description, assignedMemberId, priority, deadline, status } = req.body;
  const result = await pool.query(
    "update tasks set title=$1,description=$2,assigned_member_id=$3,priority=$4,deadline=$5,status=$6,completed_at=$7,updated_at=now() where id=$8 returning *",
    [title.trim(), description?.trim() || "", assignedMemberId || null, priority || "Medium", deadline || null, status, status === "Completed" ? new Date() : null, req.params.id]
  );
  res.json(result.rows[0]);
}));

app.delete("/api/tasks/:id", authenticate, asyncHandler(async (req, res) => {
  await pool.query("delete from tasks where id=$1", [req.params.id]);
  res.status(204).send();
}));

app.post("/api/tasks/:id/comments", authenticate, asyncHandler(async (req, res) => {
  if (!req.body.message?.trim()) return res.status(400).json({ error: "Comment is required" });
  const result = await pool.query("insert into task_comments(task_id,message) values($1,$2) returning *", [req.params.id, req.body.message.trim()]);
  res.status(201).json(result.rows[0]);
}));

app.post("/api/feedback", asyncHandler(async (req, res) => {
  if (!req.body.message?.trim()) return res.status(400).json({ error: "Feedback is required" });
  const result = await pool.query("insert into feedback(message) values($1) returning *", [req.body.message.trim()]);
  res.status(201).json(result.rows[0]);
}));

app.use((error, _req, res, _next) => {
  if (error.code === "23505") return res.status(409).json({ error: "Duplicate value" });
  if (error.code === "23503") return res.status(400).json({ error: "Referenced record was not found" });
  res.status(500).json({ error: error.message || "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`CouncilTrack API listening on http://localhost:${port}`));
