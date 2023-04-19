const Sequelize = require('sequelize');
const feedTableModel = require('./model.js').feedTableModel;

const SEQ = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: 3306,
    dialect: 'mysql',
  },
);

// feedテーブル
async function initFeedTable() {
  const FeedTable = feedTableModel(SEQ);
  await FeedTable.sync();
  return FeedTable;
}

// listコマンドで使用
// feedテーブルからthread_id, channel_idの一致するものを取得
async function selectByChannel(destId) {
  const FeedTable = await initFeedTable();

  const rows = await FeedTable.findAll({
    where: {
      dest_id: destId,
    },
  });
  return rows;
}

// /listallコマンドで使用
// feedテーブルからserver_idの一致するものを取得
async function selectByServer(serverId) {
  const FeedTable = await initFeedTable();

  const rows = await FeedTable.findAll({
    where: {
      server_id: serverId,
    },
  });
  return rows;
}

// /registerコマンドで使用
// feedテーブルにurlを追加
async function insertFeedUrl(rssUrl, webhookUrl, serverId, destId) {
  const FeedTable = await initFeedTable();

  await FeedTable.create({
    rss_url: rssUrl,
    webhook_url: webhookUrl,
    server_id: serverId,
    dest_id: destId,
  });
}

// /unsubscribeコマンドで使用
// feedテーブルからurlを削除
async function deleteFeedUrl(rssUrl, serverId, destId) {
  const FeedTable = await initFeedTable();

  await FeedTable.destroy({
    where: {
      rss_url: rssUrl,
      server_id: serverId,
      dest_id: destId,
    },
  });
}

// scraperで使用
// feedテーブルからlast_updateを更新
// async function updateLastUpdate(rssUrl, newLastUpdate)

module.exports = {
  selectByChannel,
  selectByServer,
  insertFeedUrl,
  deleteFeedUrl,
};
