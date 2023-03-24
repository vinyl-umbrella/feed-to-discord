// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('registerfeed')
    .setDescription('購読するfeedを登録する')
    .addStringOption((option) =>
      option.setName('url').setDescription('feedのURL').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('thread-id')
        .setDescription('送信先のスレッドid')
        .setRequired(true),
    ),
  // TODO: オプションを追加する．
  // RSSのURL, 宛先スレッドのID, (頻度), (favicon)
  async execute(interaction) {
    // TODO: 登録処理
    // まずURLが正しいか確認
    // 次に，既に登録されていないか確認
    // 既に登録されていたら，エラーを返す
    // 登録されていなかったら，DBに挿入する
    // スレッドIDが正しいか確認
    // その後，登録完了を返す
    await interaction.reply('feedを登録しました', { ephemeral: false });
  },
};
