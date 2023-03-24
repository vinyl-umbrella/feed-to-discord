// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletefeed')
    .setDescription('購読するfeedを削除する'),
  async execute(interaction) {
    // TODO: 削除処理
    // まず，登録されているfeedの一覧を取得
    // その後，削除するfeedが登録されているか確認
    // 登録されていなかったら，エラーを返す
    // 登録されていたら，DBから削除する
    await interaction.reply('feedを削除しました', { ephemeral: false });
  },
};
