const { selectAllFeed, updateLastUpdateDT } = require('./sql/query.js');
const { scrapeRSS, sleep, post2Discord } = require('./util/scrape-helper.js');

async function scrape() {
  // dbからRSS_URLの一覧を取得
  const rows = await selectAllFeed();
  // 各URLに対して
  for (let row of rows) {
    // rssを取得
    const feed = await scrapeRSS(row.rss_url);
    if (!feed.items) {
      continue;
    }

    await sleep(1);
    // 各記事に対して
    for (let item of feed.items.reverse()) {
      // 記事の公開日とDBの最終更新日時を比較
      if (Date.parse(item.isoDate) > Date.parse(row.last_update)) {
        // 公開日が最終更新日時より新しければ
        // webhookに投げる
        const title = feed.title ? feed.title : 'rss';
        await post2Discord(row.webhook_url, title, item.link);
        // DBの最終更新日時を更新
        await updateLastUpdateDT(row.serial, item.isoDate);
        await sleep(1);
      } else {
        // 公開日が最終更新日時より古ければ
        // 何もしない
      }
    }
  }
}
module.exports = { scrape };
