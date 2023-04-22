const Sequelize = require('sequelize');
const { log } = require('../util/log.js');
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
async function selectByChannel(channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log(
      'error',
      'selectByChannel',
      'channelId, threadIdが同時に指定されています',
    );
    return;
  }

  const FeedTable = await initFeedTable();
  let rows;

  if (threadId !== null) {
    rows = await FeedTable.findAll({
      where: {
        thread_id: threadId,
      },
    });
  } else {
    rows = await FeedTable.findAll({
      where: {
        channel_id: channelId,
      },
    });
  }
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
async function registerFeed(rssUrl, webhookUrl, serverId, channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log('error', 'registerFeed', 'channelId, threadIdが同時に指定されています');
    return;
  }

  const FeedTable = await initFeedTable();

  if (threadId !== null) {
    await FeedTable.create({
      rss_url: rssUrl,
      webhook_url: webhookUrl,
      server_id: serverId,
      thread_id: threadId,
    });
  } else {
    await FeedTable.create({
      rss_url: rssUrl,
      webhook_url: webhookUrl,
      server_id: serverId,
      channel_id: channelId,
    });
  }

  return;
}

// /unsubscribeコマンドで使用
// feedテーブルからurlを削除
async function deleteFeed(rssUrl, serverId, channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log('error', 'deleteFeed', 'channelId, threadIdが同時に指定されています');
    return;
  }

  const FeedTable = await initFeedTable();

  if (threadId !== null) {
    await FeedTable.destroy({
      where: {
        rss_url: rssUrl,
        server_id: serverId,
        thread_id: threadId,
      },
    });
  } else {
    await FeedTable.destroy({
      where: {
        rss_url: rssUrl,
        server_id: serverId,
        channel_id: channelId,
      },
    });
  }
  return;
}

// scraperで使用
// feedテーブルからlast_updateを更新
// async function updateLastUpdate(rssUrl, newLastUpdate)

module.exports = {
  selectByChannel,
  selectByServer,
  registerFeed,
  deleteFeed,
};
