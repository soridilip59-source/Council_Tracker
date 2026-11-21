require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const councilRoutes = require("./routes/councilRoutes");
const goalRoutes = require("./routes/goalRoutes");
const progressRoutes = require("./routes/progressRoutes");
const reflectionRoutes = require("./routes/reflectionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CouncilTrack AI API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Base API v1 Routing
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/councils", councilRoutes);
apiRouter.use("/goals", goalRoutes);
apiRouter.use("/progress", progressRoutes);
apiRouter.use("/reflections", reflectionRoutes);
apiRouter.use("/feedback", feedbackRoutes);
apiRouter.use("/meetings", meetingRoutes);
apiRouter.use("/reports", reportRoutes);

app.use("/api/v1", apiRouter);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
