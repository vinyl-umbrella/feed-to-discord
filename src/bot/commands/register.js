// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('購読するRSSを登録する')
    .addStringOption((option) =>
      option.setName('url').setDescription('RSSのURL').setRequired(true),
    ),
  // TODO: オプションを追加する．
  // RSSのURL, 宛先スレッドのID, (頻度), (favicon)
  async execute(interaction) {
    // TODO: 登録処理
    // まずURLが正しいか確認
    // (URLが正しいかどうかは，RSSを取得してみて，エラーが出ないかで判断する)
    // 次に，既にそのサーバで登録されていないか確認
    //   既に登録されていたら，エラーを返す
    // 投稿元がスレッドかどうかを確認
    //   スレッドの場合
    //     スレッドIDと親のチャンネルのwebhookを取得
    //   not スレッドの場合
    //     チャンネルのwebhookを取得
    // DBに挿入する
    // その後，登録完了を返す
    await interaction.reply('RSSを登録しました', { ephemeral: false });
  },
};
