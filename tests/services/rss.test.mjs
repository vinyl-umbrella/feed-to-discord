import { describe, it, expect, beforeEach } from 'vitest';
import { RSSService } from "../../src/services/rss.mjs";

describe("RSSService", () => {
  let rssService;

  beforeEach(() => {
    rssService = new RSSService();
  });

  describe("parseFeed", () => {
    it("Can parse O'Reilly RSS feed", async () => {
      const feedUrl = "https://www.oreilly.co.jp/catalog/soon.xml";
      const feed = await rssService.parseFeed(feedUrl);

      expect(feed).toBeDefined();
      expect(feed.title).toBeDefined();
      expect(feed.items).toBeInstanceOf(Array);
      expect(feed.items.length).toBeGreaterThan(0);

      const firstItem = feed.items[0];
      expect(firstItem).toHaveProperty("title");
      expect(firstItem).toHaveProperty("link");
    });

    it("Can parse AWS blog RSS feed", async () => {
      const feedUrl = "https://aws.amazon.com/blogs/compute/feed/";
      const feed = await rssService.parseFeed(feedUrl);

      expect(feed).toBeDefined();
      expect(feed.title).toBeDefined();
      expect(feed.items).toBeInstanceOf(Array);
      expect(feed.items.length).toBeGreaterThan(0);

      const firstItem = feed.items[0];
      expect(firstItem).toHaveProperty("title");
      expect(firstItem).toHaveProperty("link");
    });

    it("Can throw an error for invalid URL", async () => {
      const feedUrl = "https://example.com/nonexistent-feed";

      await expect(rssService.parseFeed(feedUrl)).rejects.toThrow();
    });
  });

  describe("getNewItems", () => {
    it("Returns one new item when `lastItemDate` is not provided", async () => {
      const feedUrl = "https://www.oreilly.co.jp/catalog/soon.xml";
      const feed = await rssService.parseFeed(feedUrl);
      const items = rssService.getNewItems(feed);

      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBe(1);
      expect(items[0]).toHaveProperty("title");
      expect(items[0]).toHaveProperty("link");
    });

    it("Returns all new items when `lastItemDate` is very old", async () => {
      const feedUrl = "https://www.oreilly.co.jp/catalog/soon.xml";
      const feed = await rssService.parseFeed(feedUrl);

      // 非常に古い日付を指定して全ての記事が新しいものとみなされるようにする
      const oldDate = new Date("2000-01-01").toISOString();
      const items = rssService.getNewItems(feed, oldDate);

      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBeGreaterThan(0);
    });

    it("Returns no new items when `lastItemDate` is in the future", async () => {
      const feedUrl = "https://www.oreilly.co.jp/catalog/soon.xml";
      const feed = await rssService.parseFeed(feedUrl);

      // 未来の日付を指定して新しい記事がないようにする
      const futureDate = new Date("2100-01-01").toISOString();
      const items = rssService.getNewItems(feed, futureDate);

      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBe(0);
    });
  });
});
