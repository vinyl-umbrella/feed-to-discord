import nacl from "tweetnacl";

/**
 * Case-insensitive header lookup
 * @param {Object} headers
 * @param {string} name - Lower-cased header name
 * @returns {string|undefined}
 */
export function getHeader(headers, name) {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key ? headers[key] : undefined;
}

/**
 * Verify Discord request signature.
 * NOTE: Never throws. A malformed signature must result in 401, not 500.
 * @param {string} signature - The signature from Discord
 * @param {string} timestamp - The timestamp from Discord
 * @param {string} body - The raw request body
 * @param {string} publicKey - Discord public key
 * @returns {boolean}
 */
export function verifySignature(signature, timestamp, body, publicKey) {
  if (!signature || !timestamp || typeof body !== "string" || !publicKey) {
    return false;
  }

  try {
    const message = Buffer.from(timestamp + body);
    const sig = Buffer.from(signature, "hex");
    const key = Buffer.from(publicKey, "hex");

    return nacl.sign.detached.verify(message, sig, key);
  } catch (error) {
    console.error("Signature verification failed:", error.message);
    return false;
  }
}

// Discord interaction types
export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

// Discord interaction response types
export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  // 3 秒以内に返して「考え中...」を表示させ、後から実結果を PATCH する
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
};
