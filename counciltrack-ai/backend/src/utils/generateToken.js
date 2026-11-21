const jwt = require("jsonwebtoken");

function generateToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, process.env.JWT_SECRET || "default_counciltrack_secret", {
    expiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "default_counciltrack_secret");
}

module.exports = { generateToken, verifyToken };
