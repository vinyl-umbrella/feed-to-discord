import { DISCORD_ERROR_CODES } from "./constants.mjs";
import { FeedSubscriptionService } from "./services/feed-subscription.mjs";
import { sendChannelMessage } from "./utils/discord-api.mjs";
import { getDiscordSecrets } from "./utils/secrets.mjs";

export const handler = async (event) => {
  try {
    const { feedUrl, feedTitle, item } = event.detail;

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

    const sendPromises = subscriptions.map((subscription) =>
      postToChannel(
        secrets.botToken,
        subscription.channelId,
        message,
        feedService,
        feedUrl,
      ),
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
 * Sends a message to a Discord channel, pruning the subscription if the
 * channel no longer exists.
 * @param {string} botToken - The Discord bot token
 * @param {string} channelId - The ID of the channel to send the message to
 * @param {string} message - The message content
 * @param {FeedSubscriptionService} feedService
 * @param {string} feedUrl
 * @returns {Promise<void>}
 */
async function postToChannel(
  botToken,
  channelId,
  message,
  feedService,
  feedUrl,
) {
  // 429 のリトライと allowed_mentions の無効化は sendChannelMessage 側で処理される
  const result = await sendChannelMessage(botToken, channelId, {
    content: message,
  });

  if (result.ok) {
    console.log(`Message sent to channel: ${channelId}`);
    return;
  }

  console.error(
    `Error sending message to channel ${channelId}: ${result.status} code=${result.code}`,
  );

  // チャンネル自体が消えている場合のみ購読を削除する。
  // 権限エラーは一時的なこともあるため残す。
  if (result.code === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL) {
    console.log(`Removing subscription for deleted channel: ${channelId}`);
    await feedService.unsubscribe(channelId, feedUrl);
  }
}
