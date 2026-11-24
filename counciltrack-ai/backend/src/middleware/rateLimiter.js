const rateLimitStore = new Map();

/**
 * In-memory sliding window rate limiter
 * @param {number} windowMs - Window duration in milliseconds
 * @param {number} max - Maximum requests per window
 */
function rateLimiter({ windowMs = 15 * 60 * 1000, max = 30 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "global";
    const now = Date.now();

    const record = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitStore.set(ip, record);

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        errors: ["Rate limit exceeded. Please wait a few minutes before submitting again."],
      });
    }

    next();
  };
}

module.exports = { rateLimiter };
