import { DISCORD_FLAGS } from "../constants.mjs";
import { FeedSubscriptionService } from "../services/feed-subscription.mjs";

/**
 * `/unsubscribe`
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<Object>} - Response data
 */
export async function handleUnsubscribeCommand(interaction) {
  const feedService = new FeedSubscriptionService();
  const channelId = interaction.channel_id;
  const options = interaction.data.options || [];

  const url = options.find((opt) => opt.name === "url")?.value;

  if (!url) {
    return {
      content: "URL needed",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }

  try {
    // Check if subscription exists for this specific channel
    const isChannelSubscribed = await feedService.isChannelSubscribed(
      channelId,
      url,
    );
    if (!isChannelSubscribed) {
      return {
        content: "This RSS feed is not subscribed in this channel.",
        flags: DISCORD_FLAGS.EPHEMERAL,
      };
    }

    // Remove subscription
    await feedService.unsubscribe(channelId, url);

    return {
      content: `Unsubscribed from RSS feed: ${url}`,
    };
  } catch (error) {
    console.error("Error in unsubscribe command:", error);
    throw error;
  }
}

export const handler = async (event) => {
  console.log("Unsubscribe command received:", JSON.stringify(event, null, 2));

  try {
    return await handleUnsubscribeCommand(event);
  } catch (error) {
    console.error("Error in unsubscribe command handler:", error);
    return {
      content: "An error occurred while processing your request.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }
};
