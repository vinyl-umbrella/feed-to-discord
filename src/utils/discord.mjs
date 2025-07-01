import nacl from "tweetnacl";

/**
 * Verify Discord request signature
 * @param {string} signature - The signature from Discord
 * @param {string} timestamp - The timestamp from Discord
 * @param {string} body - The raw request body
 * @param {string} publicKey - Discord public key
 * @returns {boolean}
 */
export function verifySignature(signature, timestamp, body, publicKey) {
  const message = Buffer.from(timestamp + body);
  const sig = Buffer.from(signature, "hex");
  const key = Buffer.from(publicKey, "hex");

  const isVerified = nacl.sign.detached.verify(message, sig, key);

  return isVerified;
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
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
};
