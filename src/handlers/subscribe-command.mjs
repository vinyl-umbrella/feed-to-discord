import { DISCORD_FLAGS } from "../constants.mjs";
import { FeedSubscriptionService } from "../services/feed-subscription.mjs";
import { RSSService } from "../services/rss.mjs";

/**
 * `/subscribe`
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<Object>} - Response data
 */
export async function handleSubscribeCommand(interaction) {
  const feedService = new FeedSubscriptionService();
  const rssService = new RSSService();
  const channelId = interaction.channel_id;
  const guildId = interaction.guild_id;
  const options = interaction.data.options || [];

  const url = options.find((opt) => opt.name === "url")?.value;

  if (!url) {
    return {
      content: "Required option `url` is missing.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (_error) {
    return {
      content: "Provided URL is not valid.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }

  try {
    // Check if already subscribed in this server
    const isAlreadySubscribed = await feedService.isSubscribed(guildId, url);
    if (isAlreadySubscribed) {
      return {
        content: "This RSS feed is already subscribed in this server.",
        flags: DISCORD_FLAGS.EPHEMERAL,
      };
    }
    console.log("provided url is not subscribed yet");

    // Validate RSS feed
    const isValidFeed = await rssService.validateFeed(url);
    if (!isValidFeed) {
      return {
        content: "Provided URL is not a valid RSS feed.",
        flags: DISCORD_FLAGS.EPHEMERAL,
      };
    }
    console.log("provided url is a valid rss feed");

    // Get feed info for title
    let feedTitle = null;
    try {
      const feed = await rssService.parseFeed(url);
      feedTitle = feed.title;
    } catch (error) {
      console.warn("Could not get feed title:", error);
    }
    console.log("feed title:", feedTitle);

    // Add subscription
    await feedService.subscribe(channelId, guildId, url, feedTitle);
    console.log("subscription added successfully");

    return {
      content: `Subscribed to RSS feed: [${feedTitle || "No Title"}](${url})`,
    };
  } catch (error) {
    console.error("Error in subscribe command:", error);
    throw error;
  }
}

export const handler = async (event) => {
  console.log("Subscribe command received:", JSON.stringify(event, null, 2));

  try {
    return await handleSubscribeCommand(event);
  } catch (error) {
    console.error("Error in subscribe command handler:", error);
    return {
      content: "An error occurred while processing your request.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }
};
