const channels = {
  goals: {
    name: "#council-goals",
    url: process.env.DISCORD_WEBHOOK_GOALS || process.env.DISCORD_WEBHOOK_URL || "",
  },
  completions: {
    name: "#goal-completions",
    url: process.env.DISCORD_WEBHOOK_COMPLETIONS || process.env.DISCORD_WEBHOOK_URL || "",
  },
  reflections: {
    name: "#weekly-reflections",
    url: process.env.DISCORD_WEBHOOK_REFLECTIONS || process.env.DISCORD_WEBHOOK_URL || "",
  },
  announcements: {
    name: "#announcements",
    url: process.env.DISCORD_WEBHOOK_ANNOUNCEMENTS || process.env.DISCORD_WEBHOOK_URL || "",
  },
  meetings: {
    name: "#meetings",
    url: process.env.DISCORD_WEBHOOK_MEETINGS || process.env.DISCORD_WEBHOOK_URL || "",
  },
  performance: {
    name: "#council-performance",
    url: process.env.DISCORD_WEBHOOK_PERFORMANCE || process.env.DISCORD_WEBHOOK_URL || "",
  },
};

module.exports = {
  channels,
  isDiscordConfigured: (channelKey) => {
    return Boolean(channels[channelKey]?.url);
  },
};
