// const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('サンプルコマンド'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
