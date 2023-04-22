const Parser = require('rss-parser');

async function scrapeRSS(url) {
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  return feed;
}

async function canParseRSS(url) {
  const parser = new Parser();
  try {
    await parser.parseURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function post2Discord(hook, sitename, link) {
  const res = await fetch(hook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: sitename,
      // avatar_url: 'https://www.google.com/favicon.ico',
      content: `${link}`,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `status code: ${res.status}\n post2Discord: ${link}, ${hook}`,
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
