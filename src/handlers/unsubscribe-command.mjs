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
    return { content: "Required option `url` is missing." };
  }

  // Check if subscription exists for this specific channel
  const isChannelSubscribed = await feedService.isChannelSubscribed(
    channelId,
    url,
  );
  if (!isChannelSubscribed) {
    return { content: "This RSS feed is not subscribed in this channel." };
  }

  await feedService.unsubscribe(channelId, url);
  console.log({ unsubscribed: url });

  return { content: `Unsubscribed from RSS feed: ${url}` };
}
