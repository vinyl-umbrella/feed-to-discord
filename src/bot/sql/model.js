const Sequelize = require('sequelize');

function feedTableModel(seq) {
  // CREATE TABLE {server_id}_feeds (
  //   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  //   url VARCHAR(255) NOT NULL UNIQUE,
  //   name VARCHAR(255) NOT NULL, -- いらないかも
  //   thread_id VARCHAR(255) NOT NULL,
  //   freq INT DEFAULT 1800,
  //   last_update DATETIME DEFAULT 2023-01-01 00:00:00,
  // );

  const FeedTable = seq.define('feed', {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    thread_id: {
      type: Sequelize.STRING(63),
      allowNull: false,
    },
    freq: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1800,
    },
    last_update: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: '2023-01-01 00:00:00',
    },
    guild_id: {
      type: Sequelize.STRING(63),
      allowNull: false,
    },
  });
  return FeedTable;
}

module.exports = { feedTableModel };
