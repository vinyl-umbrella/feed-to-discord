import Parser from "rss-parser";
import { RSS } from "../constants.mjs";

const parser = new Parser();

/**
 * RSS feed service
 */
class RSSService {
  /**
   * Fetch RSS feed content
   * @param {string} feedUrl
   * @returns {Promise<string>}
   * @private
   */
  async #fetchFeedContent(feedUrl) {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": RSS.DEFAULT_USER_AGENT,
      },
    });
    return await response.text();
  }

  /**
   * Sort RSS items by date
   * @param {Array} items
   * @returns {Array}
   * @private
   */
  #sortItemsByDate(items) {
    return items
      .filter((item) => item.pubDate || item.isoDate)
      .sort((a, b) => {
        const dateA = new Date(a.pubDate || a.isoDate);
        const dateB = new Date(b.pubDate || b.isoDate);
        return dateB - dateA;
      });
  }

  /**
   * Parse RSS feed from URL
   * @param {string} feedUrl
   * @returns {Promise<Object>}
   */
  async parseFeed(feedUrl) {
    try {
      // NOTE: parser.parseURL(feedUrl) not work for some feeds
      const text = await this.#fetchFeedContent(feedUrl);
      const feed = await parser.parseString(text);

      return feed;
    } catch (error) {
      console.error(`Error parsing feed ${feedUrl}:`, error);
      throw new Error(`Failed to parse RSS feed: ${error.message}`);
    }
  }

  /**
   * Validate RSS feed URL
   * @param {string} feedUrl
   * @returns {Promise<boolean>}
   */
  async validateFeed(feedUrl) {
    try {
      const feed = await this.parseFeed(feedUrl);
      return !!feed?.title;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get new items from feed since last check
   * @param {string} feedUrl
   * @param {string} lastItemDate
   * @returns {Promise<Array>}
   */
  async getNewItems(feedUrl, lastItemDate = null) {
    const feed = await this.parseFeed(feedUrl);

    if (!feed.items || feed.items.length === 0) {
      return [];
    }

    // Sort items by date (newest first)
    const sortedItems = this.#sortItemsByDate(feed.items);

    if (sortedItems.length === 0) {
      return [];
    }

    // If this is the first check, return only the newest item
    if (!lastItemDate) {
      return [sortedItems[0]];
    }

    // Return items newer than the last item date
    const newItems = sortedItems.filter(
      (item) =>
        new Date(item.pubDate || item.isoDate).toISOString() > lastItemDate,
    );

    return newItems.reverse(); // Return in chronological order
  }
}

export { RSSService };
