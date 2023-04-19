// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('このチャンネルの登録済みのRSSを表示する'),

  async execute(interaction) {
    // TODO: 処理
    // そのチャンネルのrssの一覧をDBから取得
    // 取得したRSSの一覧をフォーマットして返す
    await interaction.reply('このチャンネルの登録済みのRSSを表示する', {
      ephemeral: false,
    });
  },
};
