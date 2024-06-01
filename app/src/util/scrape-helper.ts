const Parser = require('rss-parser');
import { logger } from './logger';

const RequestHeaders = {
  Accept:
    'ext/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8',
};

const FeedParser = new Parser();

/**
 * sleep for the given seconds
 * @param {number} seconds
 * @returns {Promise<void>}
 */
async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * fetch the feed from the given url using `fetch()`
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchFeed(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: RequestHeaders,
  });

  return await res.text();
}

/**
 * scrape the given url and return the feed object
 * @param {string} url
 * @returns {Promise<any>}
 */
async function scrapeFeed(url: string): Promise<any> {
  const body = await fetchFeed(url);
  const feed = await FeedParser.parseString(body);

  return feed;
}

/**
 * check if the given url is a valid RSS feed
 * @param {string} url
 * @returns {boolean}
 */
async function canParseRSS(url: string): Promise<boolean> {
  try {
    await scrapeFeed(url);
    return true;
  } catch (e) {
    logger.warn(`${url}, ${e}`);
    return false;
  }
}

async function postToDiscord(
  hookUrl: string,
  sitename: string,
  title: string,
  link: string,
): Promise<void> {
  const res = await fetch(hookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: `${sitename}_BOT`,
      content: `[${title}](${link})`,
    }),
  });
  if (!res.ok) {
    throw new Error(`at postToDiscord(): status ${res.status}\n ${link}, ${hookUrl}`);
  }

  return;
}

export { scrapeFeed, canParseRSS, postToDiscord, sleep };
