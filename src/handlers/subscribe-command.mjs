import { RSS } from "../constants.mjs";
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
    return { content: "Required option `url` is missing." };
  }

  // Validate URL format.
  // 任意の URL を Lambda から取得しに行くため、スキームを制限する
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (_error) {
    return { content: "Provided URL is not valid." };
  }
  if (!RSS.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    return { content: "Only http/https URLs are supported." };
  }

  // Check if already subscribed in this server
  const isAlreadySubscribed = await feedService.isSubscribed(guildId, url);
  if (isAlreadySubscribed) {
    return { content: "This RSS feed is already subscribed in this server." };
  }

  // Validate RSS feed and get title in a single fetch
  let feed;
  try {
    feed = await rssService.parseFeed(url);
  } catch (_error) {
    return { content: "Provided URL is not a valid RSS feed." };
  }
  if (!feed?.title) {
    return { content: "Provided URL is not a valid RSS feed." };
  }

  const feedTitle = feed.title;

  await feedService.subscribe(channelId, guildId, url, feedTitle);
  console.log({ subscribed: url, feedTitle });

  return {
    content: `Subscribed to RSS feed: [${feedTitle}](${url})`,
  };
}
