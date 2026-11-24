const path = require("path");
const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const councilRoutes = require("./routes/councilRoutes");
const goalRoutes = require("./routes/goalRoutes");
const reflectionRoutes = require("./routes/reflectionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development and common deployments
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Public healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CouncilTrack AI API v2.0",
    organization: "NavGurukul Dantewada",
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API v1
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/councils", councilRoutes);
apiRouter.use("/goals", goalRoutes);
apiRouter.use("/reflections", reflectionRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/feedback", feedbackRoutes);
apiRouter.use("/leaves", leaveRoutes);

app.use("/api/v1", apiRouter);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
