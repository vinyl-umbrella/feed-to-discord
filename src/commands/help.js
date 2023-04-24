// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { log } = require('../util/log');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('help about F2D'),
  async execute(interaction) {
    log('INFO', `${interaction.guildId} /help`);
    await interaction.reply(
      '`/list`: このチャンネルの登録済みのRSSを表示する\n`/listall`: このサーバの登録済みのRSSを表示する\n`/register`: RSSのURLを登録する\n`/unsubscribe`: RSSのURLを登録解除する\n`/help`: ヘルプを表示する',
    );
  },
};
