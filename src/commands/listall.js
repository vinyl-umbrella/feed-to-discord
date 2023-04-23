const { SlashCommandBuilder } = require('discord.js');
const { selectByServer } = require('../sql/query.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listall')
    .setDescription('このサーバの登録済みのRSSを表示する'),

  async execute(interaction) {
    // DBからそのサーバの登録済みのRSSを取得
    const serverId = interaction.guildId;
    let msg = '';
    const feeds = await selectByServer(serverId);
    // TODO: #general: SITENAME, https://example.com/rss.xml
    for (let feed of feeds) {
      let dest = feed.channel_id ? feed.channel_id : feed.thread_id;
      msg += `<#${dest}>: ${feed.rss_url}\n`;
    }
    if (msg === '') {
      msg = 'このサーバには何も登録されていません';
    }
    await interaction.reply(msg, {
      ephemeral: false,
      split: true,
    });
  },
};
