const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().min(1, "ID or Email is required"),
  password: z.string().min(1, "Password is required"),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(3, "Login ID or Email is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["ADMIN", "COUNCIL", "admin", "council"]).default("COUNCIL"),
  councilId: z.string().optional().default(""),
  position: z.string().optional().default(""),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().min(3).optional(),
  password: z.string().min(4).optional().or(z.literal("")),
  councilId: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "active", "inactive"]).optional(),
});

const createCouncilSchema = z.object({
  councilName: z.string().min(2, "Council name must be at least 2 characters"),
  description: z.string().optional().default(""),
  status: z.enum(["ACTIVE", "INACTIVE", "active", "inactive"]).default("ACTIVE"),
});

const updateCouncilSchema = z.object({
  councilName: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "active", "inactive"]).optional(),
});

const createGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  expectedOutcome: z.string().optional().default(""),
  priority: z.enum(["HIGH", "MEDIUM", "LOW", "High", "Medium", "Low"]).default("MEDIUM"),
  goalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Goal date must be YYYY-MM-DD"),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  isOnLeave: z.boolean().optional(),
  leaveStartDate: z.string().optional(),
  leaveEndDate: z.string().optional(),
  leaveDays: z.union([z.number(), z.string()]).optional(),
  leaveReason: z.string().optional(),
});

const createLeaveSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  totalDays: z.union([z.number(), z.string()]),
  reason: z.string().min(2, "Reason is required"),
  handoverStudentName: z.string().min(2, "Handover student name is required"),
});

const updateGoalStatusSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "INCOMPLETE", "Pending", "Completed", "Incomplete"]),
  incompleteReason: z.string().optional().default(""),
});

const submitReflectionSchema = z.object({
  reflectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Reflection date must be YYYY-MM-DD"),
  achievements: z.string().min(3, "Achievements field is required"),
  challenges: z.string().min(3, "Challenges field is required"),
  learnings: z.string().min(3, "Learnings field is required"),
  improvements: z.string().min(3, "Improvements field is required"),
  goalStatuses: z.array(
    z.object({
      goalId: z.string(),
      status: z.enum(["COMPLETED", "INCOMPLETE", "PENDING", "Completed", "Incomplete", "Pending"]),
      incompleteReason: z.string().optional().default(""),
    })
  ).optional().default([]),
});

const feedbackSchema = z.object({
  studentName: z.string().optional().default(""),
  councilId: z.string().min(1, "Council selection is required"),
  feedbackType: z.enum(["GENERAL", "SUGGESTION", "COMPLAINT", "General Feedback", "Suggestion", "Complaint"]),
  message: z.string().min(5, "Message must be at least 5 characters"),
  contact: z.string().optional().default(""),
});

const updateFeedbackStatusSchema = z.object({
  status: z.enum(["NEW", "UNDER_REVIEW", "RESOLVED", "New", "Under Review", "Resolved"]),
});

const updateFeedbackNotesSchema = z.object({
  adminNotes: z.string().default(""),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createCouncilSchema,
  updateCouncilSchema,
  createGoalSchema,
  updateGoalStatusSchema,
  submitReflectionSchema,
  feedbackSchema,
  updateFeedbackStatusSchema,
  updateFeedbackNotesSchema,
  createLeaveSchema,
};
