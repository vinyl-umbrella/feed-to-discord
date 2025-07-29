import { DISCORD_FLAGS } from "../constants.mjs";
import { FeedSubscriptionService } from "../services/feed-subscription.mjs";

/**
 * `/list`, `/list all True`
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<Object>} - Response data
 */
export async function handleListCommand(interaction) {
  const feedService = new FeedSubscriptionService();
  const channelId = interaction.channel_id;
  const guildId = interaction.guild_id;
  const options = interaction.data.options || [];

  const showAll = options.find((opt) => opt.name === "all")?.value;

  try {
    let feeds;
    if (showAll) {
      // Get all feeds for the guild
      feeds = await feedService.getFeedsByGuild(guildId);
    } else {
      // Get feeds for this specific channel
      feeds = await feedService.getFeedsByChannel(channelId);
    }

    if (feeds.length === 0) {
      return {
        content: showAll
          ? "No feeds in this server."
          : "No feeds in this channel.",
      };
    }

    const feedList = feeds
      .map((item) => `- [${item.feedTitle || "No Title"}](${item.feedUrl})`)
      .join("\n");
    const title = showAll
      ? "Subscribed RSS Feeds in this Server:"
      : "Subscribed RSS Feeds in this Channel:";

    return {
      content: `${title}\n${feedList}`,
    };
  } catch (error) {
    console.error("Error in list command:", error);
    throw error;
  }
}

export const handler = async (event) => {
  console.log("List command received:", JSON.stringify(event, null, 2));

  try {
    return await handleListCommand(event);
  } catch (error) {
    console.error("Error in list command handler:", error);
    return {
      content: "An error occurred while processing your request.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }
};
