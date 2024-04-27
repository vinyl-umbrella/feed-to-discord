const Parser = require('rss-parser');
import { logger } from './logger';

const RequestHeaders = {
  Accept:
    'ext/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8',
};

async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function scrapeFeed(url: string): Promise<any> {
  const parser = new Parser({
    headers: RequestHeaders,
    timeout: 10000,
  });

  const feed = await parser.parseURL(url);
  return feed;
}

async function canParseRSS(url: string): Promise<boolean> {
  const parser = new Parser({
    headers: RequestHeaders,
    timeout: 10000,
  });

  try {
    await parser.parseURL(url);
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
      content: `${title}, ${link}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`at postToDiscord(): status ${res.status}\n ${link}, ${hookUrl}`);
  }

  return;
}

export { scrapeFeed, canParseRSS, postToDiscord, sleep };
