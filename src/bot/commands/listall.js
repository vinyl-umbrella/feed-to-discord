const { SlashCommandBuilder } = require('discord.js');
// const

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listall')
    .setDescription('このサーバの登録済みのRSSを表示する'),

  async execute(interaction) {
    // TODO: 処理
    // DBからそのサーバの登録済みのRSSを取得
    // 取得したRSSの一覧をフォーマットして返す
    await interaction.reply('このサーバの登録済みのRSSを表示する', {
      ephemeral: false,
    });
  },
};
