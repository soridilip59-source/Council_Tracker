function getCorsOrigins() {
  const envOrigins = process.env.CORS_ORIGIN || "";
  return envOrigins
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function isOriginAllowed(origin) {
  // Allow requests without Origin header (e.g. mobile apps, curl, Postman, backend-to-backend)
  if (!origin) return true;

  const allowed = getCorsOrigins();

  // If no CORS_ORIGIN is set or wildcard '*' is present, allow all
  if (allowed.length === 0 || allowed.includes("*")) {
    return true;
  }

  const clean = origin.replace(/\/$/, "");

  // Allow explicit match in CORS_ORIGIN
  if (allowed.includes(clean)) return true;

  // Allow local development
  if (clean.includes("localhost") || clean.includes("127.0.0.1")) return true;

  // Allow all Vercel deployments (*.vercel.app)
  if (clean.endsWith(".vercel.app")) return true;

  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = {
  getCorsOrigins,
  isOriginAllowed,
  corsOptions,
};
