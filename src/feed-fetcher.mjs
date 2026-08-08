import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { EVENT_BRIDGE, FEED_FETCH_CONCURRENCY } from "./constants.mjs";
import { FeedSubscriptionService } from "./services/feed-subscription.mjs";
import { RSSService } from "./services/rss.mjs";
import { mapWithConcurrency } from "./utils/concurrency.mjs";

const eventBridge = new EventBridgeClient();

export const handler = async (_) => {
  console.log("Starting RSS feed check...");

  try {
    const feedService = new FeedSubscriptionService();
    const rssService = new RSSService();

    // Get all unique feed URLs
    const uniqueFeeds = await feedService.getAllFeedUrls();

    // 全フィードを同時に取得すると Lambda のタイムアウトと外部負荷が読めないため制限する
    const results = await mapWithConcurrency(
      uniqueFeeds,
      FEED_FETCH_CONCURRENCY,
      (feedInfo) => checkFeed(feedInfo, rssService, feedService),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(
      `Checked ${uniqueFeeds.length} unique feeds (${failed} failed)`,
    );
    return { statusCode: 200 };
  } catch (error) {
    console.error("Error in feed fetcher:", error);
    return { statusCode: 500, error: error.message };
  }
};

/**
 * Check a single feed for new items
 * @param {Object} feedInfo - Contains feedUrl and lastItemDate
 * @param {RSSService} rssService
 * @param {FeedSubscriptionService} feedService
 * @returns {Promise<void>}
 * */
async function checkFeed(feedInfo, rssService, feedService) {
  const { feedUrl, lastItemDate } = feedInfo;

  try {
    console.log(`Checking feed: ${feedUrl}`);

    const feed = await rssService.parseFeed(feedUrl);
    const now = new Date().toISOString();

    // Query subscriptions once and reuse for all updates
    const subscriptions = await feedService.getChannelsByFeed(feedUrl);

    // Build update fields
    const updateFields = { lastChecked: now };
    if (feed.title) {
      updateFields.feedTitle = feed.title;
    }

    if (!feed.items || feed.items.length === 0) {
      console.log(`No items found in feed: ${feedUrl}`);
      await feedService.updateFeedStatus(subscriptions, updateFields);
      return;
    }

    // Get new items using RSSService
    const newItems = rssService.getNewItems(feed, lastItemDate);

    if (newItems.length > 0) {
      // NOTE: 配信に失敗したまま lastItemDate を進めると記事を取りこぼすため、
      // 送信が完全に成功した場合のみカーソルを進める。
      // 失敗時は throw され、次回の実行で同じ記事が再送される。
      await sendItemsToEventBridge(feedUrl, feed.title, newItems);

      // Include lastItemDate in the same update
      const newestItem = newItems[newItems.length - 1]; // Last item in chronological order
      updateFields.lastItemDate = new Date(
        newestItem.pubDate || newestItem.isoDate,
      ).toISOString();
    }

    // Single batch update for all fields
    await feedService.updateFeedStatus(subscriptions, updateFields);
  } catch (error) {
    console.error(`Error checking feed ${feedUrl}:`, error);
    throw error;
  }
}

/**
 * Sends new feed items to EventBridge in batches of up to 10.
 * Throws if any entry could not be published.
 * @param {string} feedUrl - The URL of the RSS feed
 * @param {string} feedTitle - The title of the RSS feed
 * @param {Array} items - The feed items to send
 */
async function sendItemsToEventBridge(feedUrl, feedTitle, items) {
  const MAX_ENTRIES = 10;

  for (let i = 0; i < items.length; i += MAX_ENTRIES) {
    const batch = items.slice(i, i + MAX_ENTRIES);
    const entries = batch.map((item) => ({
      Source: EVENT_BRIDGE.SOURCE,
      DetailType: EVENT_BRIDGE.DETAIL_TYPE,
      Detail: JSON.stringify({
        feedUrl,
        feedTitle,
        item: {
          title: item.title,
          link: item.link,
        },
      }),
    }));

    const result = await eventBridge.send(
      new PutEventsCommand({ Entries: entries }),
    );

    // 部分失敗 (FailedEntryCount) を見逃すと該当記事だけ静かに消える
    if (result.FailedEntryCount > 0) {
      const reasons = result.Entries.filter((e) => e.ErrorCode)
        .map((e) => `${e.ErrorCode}: ${e.ErrorMessage}`)
        .join(", ");
      throw new Error(
        `Failed to publish ${result.FailedEntryCount}/${entries.length} events for ${feedUrl} (${reasons})`,
      );
    }

    console.log(
      `Sent ${entries.length} items to EventBridge for feed: ${feedUrl}`,
    );
  }
}
