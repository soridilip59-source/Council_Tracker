const crypto = require("crypto");

function generateId(prefix = "id") {
  const randomStr = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${Date.now().toString(36)}_${randomStr}`;
}

module.exports = { generateId };
