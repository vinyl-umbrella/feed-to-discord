const Sequelize = require('sequelize');
const { log } = require('../util/log.js');
const feedTableModel = require('./model.js').feedTableModel;

const SEQ = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
  },
);

// feedテーブル
async function initFeedTable() {
  const FeedTable = feedTableModel(SEQ);
  await FeedTable.sync();
  return FeedTable;
}

// /listコマンドで使用
// feedテーブルからthread_id, channel_idの一致するものを取得
async function selectByChannel(channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log('error selectByChannel channelId, threadIdが同時に指定されています');
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

// /unsubscribeコマンドで使用
// feedテーブルからurlが一致するものがあるか判定
async function selectByUrl(rssUrl, channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log('error selectByUrl channelId, threadIdが同時に指定されています');
    return;
  }

  const FeedTable = await initFeedTable();
  let rows;

  if (threadId !== null) {
    rows = await FeedTable.findAll({
      where: {
        rss_url: rssUrl,
        thread_id: threadId,
      },
    });
  } else {
    rows = await FeedTable.findAll({
      where: {
        rss_url: rssUrl,
        channel_id: channelId,
      },
    });
  }
  // 一致するものがあれば，trueを返す
  return rows.length > 0;
}

// /registerコマンドで使用
// すでにそのサーバで登録されているか判定
async function selectByUrlServer(rssUrl, serverId) {
  const FeedTable = await initFeedTable();
  const rows = await FeedTable.findAll({
    attributes: ['rss_url', 'server_id', 'channel_id', 'thread_id'],
    where: {
      rss_url: rssUrl,
      server_id: serverId,
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
async function registerFeed(rssUrl, webhookUrl, serverId, channelId, threadId) {
  // validation
  if (channelId !== null && threadId !== null) {
    log('error registerFeed channelId, threadIdが同時に指定されています');
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
    log('error deleteFeed channelId, threadIdが同時に指定されています');
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
// feedテーブルからrss_urlのリストを取得
async function selectAllFeed() {
  const FeedTable = await initFeedTable();
  const rows = await FeedTable.findAll({
    attributes: ['serial', 'rss_url', 'webhook_url', 'last_update'],
  });
  return rows;
}

// scraperで使用
// feedテーブルからlast_updateを更新
async function updateLastUpdateDT(serial, newLastUpdate) {
  const FeedTable = await initFeedTable();
  await FeedTable.update(
    {
      last_update: newLastUpdate,
    },
    {
      where: {
        serial: serial,
      },
    },
  );
  return;
}

module.exports = {
  selectByChannel,
  selectByServer,
  selectByUrl,
  selectByUrlServer,
  registerFeed,
  deleteFeed,
  selectAllFeed,
  updateLastUpdateDT,
};
