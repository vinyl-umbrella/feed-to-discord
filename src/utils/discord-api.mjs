import { DISCORD } from "../constants.mjs";

/**
 * @typedef {Object} DiscordApiResult
 * @property {boolean} ok
 * @property {number} status - HTTP status (0 if the request never completed)
 * @property {number|undefined} code - Discord JSON error code
 * @property {Object|undefined} body
 */

/**
 * Call the Discord REST API, honouring 429 rate limits.
 * Never throws: callers decide what to do with a failure.
 * @param {string} path - Path below the API base, e.g. `/channels/123/messages`
 * @param {Object} options - fetch options (headers are merged with Content-Type)
 * @returns {Promise<DiscordApiResult>}
 */
async function request(path, options) {
  for (let attempt = 0; attempt <= DISCORD.MAX_RATE_LIMIT_RETRIES; attempt++) {
    let response;
    try {
      response = await fetch(`${DISCORD.API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    } catch (error) {
      console.error(`Discord API request failed (${path}):`, error.message);
      return { ok: false, status: 0 };
    }

    if (response.ok) {
      return { ok: true, status: response.status };
    }

    const body = await response.json().catch(() => ({}));

    // レート制限。retry_after (秒) だけ待って再送する
    if (response.status === 429 && attempt < DISCORD.MAX_RATE_LIMIT_RETRIES) {
      const retryAfterMs = Math.ceil((body.retry_after ?? 1) * 1000);
      console.warn(`Rate limited on ${path}. Retrying in ${retryAfterMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
      continue;
    }

    return { ok: false, status: response.status, code: body.code, body };
  }

  return { ok: false, status: 429 };
}

/**
 * Build a message payload with mentions disabled.
 * Feed titles are attacker-controlled, so `@everyone` must never resolve.
 * @param {Object} data - Discord message data
 * @returns {Object}
 */
function withoutMentions(data) {
  return { allowed_mentions: DISCORD.NO_MENTIONS, ...data };
}

/**
 * Replace the deferred interaction response with the real result.
 * NOTE: whether the message is ephemeral is fixed when the interaction is
 * deferred; `flags` passed here are ignored by Discord.
 * @param {string} applicationId
 * @param {string} interactionToken
 * @param {Object} data - Discord message data
 * @returns {Promise<DiscordApiResult>}
 */
export async function editOriginalInteractionResponse(
  applicationId,
  interactionToken,
  data,
) {
  return await request(
    `/webhooks/${applicationId}/${interactionToken}/messages/@original`,
    {
      method: "PATCH",
      body: JSON.stringify(withoutMentions(data)),
    },
  );
}

/**
 * Post a message to a channel as the bot.
 * @param {string} botToken
 * @param {string} channelId
 * @param {Object} data - Discord message data
 * @returns {Promise<DiscordApiResult>}
 */
export async function sendChannelMessage(botToken, channelId, data) {
  return await request(`/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${botToken}` },
    body: JSON.stringify(withoutMentions(data)),
  });
}
