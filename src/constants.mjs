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
  FETCH_TIMEOUT_MS: 10 * 1000,
  MAX_BYTES: 5 * 1024 * 1024, // 5 MiB
  ALLOWED_PROTOCOLS: ["http:", "https:"],
};

// Discord API
export const DISCORD = {
  API_BASE: "https://discord.com/api/v10",
  MAX_CONTENT_LENGTH: 2000,
  // フィードのタイトルに @everyone 等が含まれていても発火させないための指定
  NO_MENTIONS: { parse: [] },
  MAX_RATE_LIMIT_RETRIES: 3,
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

// Feed fetcher
export const FEED_FETCH_CONCURRENCY = 10;
