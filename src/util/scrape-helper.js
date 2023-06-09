const Parser = require('rss-parser');
const { log } = require('./log');

const Headers = {
  Accept:
    'ext/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8',
};

async function scrapeRSS(url) {
  const parser = new Parser({
    headers: Headers,
    timeout: 10000,
  });
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (e) {
    log('ERROR', `at scrapeRSS(): ${url}, ${e}`);
    return {};
  }
}

async function canParseRSS(url) {
  const parser = new Parser({
    headers: Headers,
    timeout: 10000,
  });
  try {
    await parser.parseURL(url);
    return true;
  } catch (e) {
    log('ERROR', `at canParseRSS(): ${url}, ${e}`);
    return false;
  }
}

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function post2Discord(hook, sitename, title, link) {
  // もし link のドメインが"nitter.it"であれば"vxtwitter.com"にreplace
  const articleDomain = new URL(link).hostname;
  if (articleDomain === 'nitter.it') {
    // TODO: vxtwitter.com vx twitter.com  どっちがいいんだろう？
    link = link.replace('nitter.it', 'vxtwitter.com');
    if (link.endsWith('#m')) {
      link = link.slice(0, -2);
    }
  }

  const res = await fetch(hook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: `${sitename}_F2D`,
      // avatar_url: 'https://www.google.com/favicon.ico',
      content: `${title}, ${link}`,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `at post2Discord(): status ${res.status}\n ${link}, ${hook}`,
    );
  }

  return;
}

module.exports = {
  scrapeRSS,
  canParseRSS,
  sleep,
  post2Discord,
};
