const { SlashCommandBuilder } = require('discord.js');
const { selectByServer } = require('../sql/query.js');
const { log } = require('../util/log.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listall')
    .setDescription('このサーバの登録済みのRSSを表示する'),

  async execute(interaction) {
    log('INFO', `${interaction.guildId} /listall`);
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

    // 2000文字を超える場合は分割して送信
    if (msg.length > 2000) {
      await interaction.reply('-------- very long msg --------');
      await sendSplittedMsg(interaction.channel, msg);
      return;
    }

    await interaction.reply(msg);
  },
};
