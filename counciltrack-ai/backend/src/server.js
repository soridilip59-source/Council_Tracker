const path = require("path");
// Load .env from multiple possible locations (local dev: backend/.env or root; Docker/Railway: env vars injected directly)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") }) ||
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") }) ||
  require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { setSocketIO } = require("./utils/socketEmitter");
const { testConnection } = require("./config/db");

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
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

server.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`  CouncilTrack AI Backend Server Running! (v2.0)`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`  Public Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`  Timezone: ${process.env.TZ || "Asia/Kolkata"}`);
  console.log(`===================================================`);
  await testConnection();
});

server.once("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in backend/.env.`);
  } else {
    console.error("Backend server failed to start:", error);
  }
  process.exitCode = 1;
});
