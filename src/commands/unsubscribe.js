const { SlashCommandBuilder } = require('discord.js');
const { selectByUrl, deleteFeed } = require('../sql/query.js');
const { log } = require('../util/log.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unsubscribe')
    .setDescription('RSSの購読を解除する')
    .addStringOption((option) =>
      option.setName('url').setDescription('RSSのURL').setRequired(true),
    ),
  async execute(interaction) {
    log(
      'INFO',
      `${interaction.guildId} /unsubscribe ${interaction.options.getString(
        'url',
      )}`,
    );
    let channelId = interaction.channelId;
    let threadId = null;

    // スレッドから呼ばれた場合
    if (interaction.channel.type === 11) {
      channelId = null;
      threadId = interaction.channelId;
    }

    // 登録されていなかったら，early return
    const selectResult = await selectByUrl(
      interaction.options.getString('url'),
      channelId,
      threadId,
    );

    if (!selectResult) {
      await interaction.reply(
        'このチャンネルには指定されたURLは登録されていません',
        { ephemeral: false },
      );
      return;
    }

    // 登録されていたら，DBから削除する
    await deleteFeed(
      interaction.options.getString('url'),
      interaction.guildId,
      channelId,
      threadId,
    );

    await interaction.reply('購読を解除しました', { ephemeral: false });
  },
};
