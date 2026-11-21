const aiConfig = {
  provider: process.env.AI_PROVIDER || "heuristic",
  apiKey: process.env.AI_API_KEY || "",
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  isConfigured: () => {
    if (process.env.AI_PROVIDER === "heuristic") return true;
    return Boolean(process.env.AI_API_KEY);
  },
};

module.exports = { aiConfig };
