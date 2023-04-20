const Sequelize = require('sequelize');

function feedTableModel(seq) {
  //  CREATE TABLE feed (
  //   serial UNSIGHNED INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  # 連番
  //   server_id VARCHAR(32) NOT NULL,                            # discordのサーバID
  //   channel_id VARCHAR(32) DEFAULT NULl,                       # discordのチャンネルID
  //   thread_id VARCHAR(32) DEFAULT NULl,                        # discordのスレッドID
  //   rss_url VARCHAR(255) NOT NULL,                             # RSSのURL
  //   webhook_url TEXT NOT NULL,                                 # webhookのURL
  //   last_update DATETIME DEFAULT 2023-01-01 00:00:00,          # 最終更新日時
  // );

  const FeedTable = seq.define('feed', {
    serial: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    server_id: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
    channel_id: {
      type: Sequelize.STRING(32),
      allowNull: true,
      defaultValue: null,
    },
    thread_id: {
      type: Sequelize.STRING(32),
      allowNull: true,
      defaultValue: null,
    },
    rss_url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    webhook_url: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    last_update: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: '2023-01-01 00:00:00',
    },
  });
  return FeedTable;
}

module.exports = { feedTableModel };
