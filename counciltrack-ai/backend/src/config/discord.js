const channels = {
  get goals() {
    return {
      name: "#council-goals",
      url: process.env.DISCORD_WEBHOOK_GOALS || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
  get completions() {
    return {
      name: "#goal-completions",
      url: process.env.DISCORD_WEBHOOK_COMPLETIONS || process.env.DISCORD_WEBHOOK_GOALS || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
  get reflections() {
    return {
      name: "#weekly-reflections",
      url: process.env.DISCORD_WEBHOOK_REFLECTIONS || process.env.DISCORD_WEBHOOK_GOALS || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
  get announcements() {
    return {
      name: "#announcements",
      url: process.env.DISCORD_WEBHOOK_ANNOUNCEMENTS || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
  get meetings() {
    return {
      name: "#meetings",
      url: process.env.DISCORD_WEBHOOK_MEETINGS || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
  get performance() {
    return {
      name: "#council-performance",
      url: process.env.DISCORD_WEBHOOK_PERFORMANCE || process.env.DISCORD_WEBHOOK_URL || "",
    };
  },
};

module.exports = {
  channels,
  isDiscordConfigured: (channelKey) => {
    if (!channelKey) {
      return Boolean(
        process.env.DISCORD_WEBHOOK_URL ||
        process.env.DISCORD_WEBHOOK_GOALS ||
        process.env.DISCORD_WEBHOOK_COMPLETIONS ||
        process.env.DISCORD_WEBHOOK_REFLECTIONS ||
        process.env.DISCORD_WEBHOOK_ANNOUNCEMENTS ||
        process.env.DISCORD_WEBHOOK_MEETINGS ||
        process.env.DISCORD_WEBHOOK_PERFORMANCE
      );
    }
    return Boolean(channels[channelKey]?.url);
  },
};
