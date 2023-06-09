const { SlashCommandBuilder } = require('discord.js');
const { selectByChannel } = require('../sql/query.js');
const { log } = require('../util/log.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('このチャンネルの登録済みのRSSを表示する'),

  async execute(interaction) {
    log('INFO', `${interaction.guildId} /list`);
    let channelId = interaction.channelId;
    let threadId = null;

    // スレッドから呼ばれた場合
    if (interaction.channel.type === 11) {
      channelId = null;
      threadId = interaction.channelId;
    }

    // 呼び出し元のチャンネルのrssの一覧をDBから取得
    const feeds = await selectByChannel(channelId, threadId);
    // 取得したRSSの一覧をフォーマットする
    let msg = '';
    for (let feed of feeds) {
      msg += feed.rss_url + '\n';
    }
    if (msg === '') {
      msg = 'このチャンネルには何も登録されていません';
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
