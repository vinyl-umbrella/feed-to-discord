// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listfeed')
    .setDescription('登録済みのRSSを表示する'),

  async execute(interaction) {
    // TODO: 処理
    // DBから登録済みのRSSを取得
    // 取得したRSSをフォーマットして返す
    await interaction.reply('登録済みのRSSを表示する', { ephemeral: false });
  },
};
