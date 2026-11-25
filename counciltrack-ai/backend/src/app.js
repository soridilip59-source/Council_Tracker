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
const weeklyGoalRoutes = require("./routes/weeklyGoalRoutes");

const { corsOptions } = require("./config/cors");
const { isConfigured: isSheetsConfigured, getSheetId } = require("./config/googleSheets");
const { isDiscordConfigured, channels } = require("./config/discord");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Public healthcheck
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CouncilTrack AI API v2.0",
    organization: "NavGurukul Dantewada",
    googleSheets: {
      connected: isSheetsConfigured(),
      sheetId: getSheetId() ? `${getSheetId().slice(0, 8)}...` : null,
    },
    discord: {
      configured: isDiscordConfigured(),
    },
    cors: {
      configuredOrigins: process.env.CORS_ORIGIN || "all allowed",
    },
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
apiRouter.use("/weekly-goals", weeklyGoalRoutes);

app.use("/api/v1", apiRouter);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
