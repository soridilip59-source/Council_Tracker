const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { setSocketIO } = require("./utils/socketEmitter");
const { initDailyReminderJob } = require("./jobs/dailyReminderJob");
const { initMeetingReminderJob } = require("./jobs/meetingReminderJob");
const { initMonthlyReportJob } = require("./jobs/monthlyReportJob");

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

setSocketIO(io);

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("join:council", (councilId) => {
    if (councilId) {
      socket.join(`council:${councilId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room council:${councilId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Initialize Scheduled Background Jobs
initDailyReminderJob();
initMeetingReminderJob();
initMonthlyReportJob();

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  CouncilTrack AI Backend Server Running!`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`  Socket.IO: Active and accepting connections`);
  console.log(`  Timezone: ${process.env.TZ || "Asia/Kolkata"}`);
  console.log(`===================================================`);
});
