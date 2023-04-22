// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('help about F2D'),
  async execute(interaction) {
    await interaction.reply(
      '/list: このチャンネルの登録済みのRSSを表示する\n/listall: このサーバの登録済みのRSSを表示する\n/register: RSSのURLを登録する\n/unsubscribe: RSSのURLを登録解除する\n/help: ヘルプを表示する',
    );
  },
};
