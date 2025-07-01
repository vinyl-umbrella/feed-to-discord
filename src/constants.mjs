// EventBridge
export const EVENT_BRIDGE = {
  SOURCE: "rss-bot",
  DETAIL_TYPE: "New Feed Item",
};

// Secrets Manager
export const CACHE_DURATION = 5 * 60 * 1000; // 5 min

// DynamoDB
export const DYNAMODB = {
  FEED_URL_INDEX: "feedUrl-index",
  GUILD_ID_INDEX: "guildId-index",
};

// RSS
export const RSS = {
  DEFAULT_USER_AGENT: "rssbot/1.0",
};

// Discord Error Codes
export const DISCORD_ERROR_CODES = {
  MISSING_PERMISSIONS: 50013,
  UNKNOWN_CHANNEL: 10003,
};

// Discord Message Flags
export const DISCORD_FLAGS = {
  EPHEMERAL: 64, // Show Only to the user who invoked the command
};
