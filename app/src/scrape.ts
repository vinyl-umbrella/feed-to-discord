import { AppDataSource } from './data-source';
import { Feed } from './models/feed';
import { postToDiscord, scrapeFeed } from './util/scrape-helper';
import { logger } from './util/logger';
import { Notification } from './models/notification';
const retry = require('async-retry');

const retryConfig = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
  onRetry: (err: string, n: number) => logger.warn(`retrying ${n} times, error: ${err}`),
};

async function scrape(): Promise<void> {
  logger.info('start scraping');

  const feedTable = AppDataSource.getRepository(Feed);
  const feeds = await feedTable.find();

  // loop by feed_urls in db
  for (const feed of feeds) {
    const parsed = await scrapeFeed(feed.feed_url).catch((err) => {
      logger.error(`failed to fetch ${feed.feed_url}, ${err}`);
      throw err;
    });

    if (!parsed!.items) continue;

    const Sitename = parsed.title ? parsed.title : 'rss';

    // loop by articles in fetched feed
    for (const item of parsed!.items.reverse()) {
      if (Date.parse(item.isoDate as string) > new Date(feed.last_updated_at).getTime()) {
        const ItemTitle = item.title ? item.title : 'no title';

        // notificaiton から row.feed_id に紐づく webhook_url を取得する
        let notifs = await AppDataSource.createQueryBuilder(Notification, 'notification')
          .leftJoin(Feed, 'feed', 'notification.feed_id = feed.uuid')
          .where('feed.uuid = :feedId', { feedId: feed.uuid })
          .getMany();

        // loop by webhook_url
        for (const notif of notifs) {
          await retry(async () => {
            await postToDiscord(notif.webhook_url, Sitename, ItemTitle, item.link);
          }, retryConfig);
        }
        // after all post to discord, update last_updated_at
        await AppDataSource.getRepository(Feed).update(
          { uuid: feed.uuid },
          { last_updated_at: item.isoDate },
        );
      }
    }
  }
  return;
}

export { scrape };
