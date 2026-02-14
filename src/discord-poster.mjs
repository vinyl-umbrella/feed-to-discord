import { DISCORD_ERROR_CODES } from "./constants.mjs";
import { FeedSubscriptionService } from "./services/feed-subscription.mjs";
import { getDiscordSecrets } from "./utils/secrets.mjs";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export const handler = async (event) => {
  console.log(event);

  try {
    const eventDetail = event.detail;
    const { feedUrl, feedTitle, item } = eventDetail;

    // Get Discord secrets
    const secrets = await getDiscordSecrets();

    // Get all channels subscribed to this feed using the service
    const feedService = new FeedSubscriptionService();
    const subscriptions = await feedService.getChannelsByFeed(feedUrl);

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for feed: ${feedUrl}`);
      return { statusCode: 200 };
    }

    // Format the message
    const message = `${feedTitle}\n[${item.title || "No Title"}](${item.link || ""})`;

    // Send message to each subscribed channel
    const sendPromises = subscriptions.map((subscription) =>
      sendToChannel(secrets.botToken, subscription.channelId, message),
    );

    await Promise.allSettled(sendPromises);

    console.log(`Sent message to ${subscriptions.length} channels`);
    return { statusCode: 200 };
  } catch (error) {
    console.error("Error in discord poster:", error);
    return { statusCode: 500, error: error.message };
  }
};

/**
 * Sends a message to a Discord channel via REST API.
 * @param {string} botToken - The Discord bot token
 * @param {string} channelId - The ID of the channel to send the message to
 * @param {string} message - The message content
 * @returns {Promise<void>}
 */
async function sendToChannel(botToken, channelId, message) {
  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorCode = errorBody.code;

      if (
        errorCode === DISCORD_ERROR_CODES.MISSING_PERMISSIONS ||
        errorCode === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL
      ) {
        console.log(`Removing invalid subscription for channel: ${channelId}`);
        // NOTE: In a production environment, you might want to remove the subscription from DynamoDB
      }

      console.error(
        `Error sending message to channel ${channelId}: ${response.status} ${JSON.stringify(errorBody)}`,
      );
      return;
    }

    console.log(`Message sent to channel: ${channelId}`);
  } catch (error) {
    console.error(`Error sending message to channel ${channelId}:`, error);
  }
}
