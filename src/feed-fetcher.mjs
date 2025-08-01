import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { EVENT_BRIDGE } from "./constants.mjs";
import { FeedSubscriptionService } from "./services/feed-subscription.mjs";
import { RSSService } from "./services/rss.mjs";

const eventBridge = new EventBridgeClient();

export const handler = async (_) => {
  console.log("Starting RSS feed check...");

  try {
    const feedService = new FeedSubscriptionService();
    const rssService = new RSSService();

    // Get all unique feed URLs
    const uniqueFeeds = await feedService.getAllFeedUrls();

    const promises = uniqueFeeds.map((feedInfo) =>
      checkFeed(feedInfo, rssService, feedService),
    );

    await Promise.allSettled(promises);

    console.log(`Checked ${uniqueFeeds.length} unique feeds`);
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

    // Update last checked time for all subscriptions of this feed
    await feedService.updateLastChecked(feedUrl, now, feed.title);

    if (!feed.items || feed.items.length === 0) {
      console.log(`No items found in feed: ${feedUrl}`);
      return;
    }

    // Get new items using RSSService
    const newItems = await rssService.getNewItems(feedUrl, lastItemDate);

    if (newItems.length > 0) {
      // Send new items to EventBridge
      for (const item of newItems) {
        await sendToEventBridge(feedUrl, feed.title, item);
      }

      // Update last item date for all subscriptions of this feed
      const newestItem = newItems[newItems.length - 1]; // Last item in chronological order
      const newestItemDate = new Date(
        newestItem.pubDate || newestItem.isoDate,
      ).toISOString();
      await feedService.updateLastItemDate(feedUrl, newestItemDate);
    }
  } catch (error) {
    console.error(`Error checking feed ${feedUrl}:`, error);
  }
}

/**
 * Sends a new feed item to EventBridge.
 * @param {string} feedUrl - The URL of the RSS feed
 * @param {string} feedTitle - The title of the RSS feed
 * @param {Object} item - The feed item
 */
async function sendToEventBridge(feedUrl, feedTitle, item) {
  try {
    const eventDetail = {
      feedUrl,
      feedTitle,
      item: {
        title: item.title,
        link: item.link,
      },
    };

    await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: EVENT_BRIDGE.SOURCE,
            DetailType: EVENT_BRIDGE.DETAIL_TYPE,
            Detail: JSON.stringify(eventDetail),
          },
        ],
      }),
    );

    console.log(`Sent new item to EventBridge: ${item.title}`);
  } catch (error) {
    console.error("Error sending to EventBridge:", error);
  }
}
