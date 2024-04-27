import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import { bot } from '../index';
import { logger } from '../util/logger';

export default {
  data: new SlashCommandBuilder().setName('help').setDescription('show commands list of this bot'),

  async execute(interaction: CommandInteraction) {
    logger.info(`${interaction.guildId} /help`);
    let commands = bot.slashCommandsMap;

    let msg = '';
    commands.forEach((cmd) => {
      msg += `\n\`${cmd.data.name}\`: ${cmd.data.description}`;
    });
    await interaction.reply(msg);
  },
};
