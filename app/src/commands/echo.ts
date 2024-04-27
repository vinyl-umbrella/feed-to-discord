import {
  SlashCommandBuilder,
  type CommandInteraction,
  type SlashCommandStringOption,
} from 'discord.js';
import { logger } from '../util/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('echo command')
    .addStringOption((opt: SlashCommandStringOption) =>
      opt.setName('text').setDescription('text to echo').setRequired(true),
    ),

  async execute(interaction: CommandInteraction) {
    logger.info(`${interaction.guildId} /echo`);
    const msg = String(interaction.options.get('text')?.value);
    await interaction.reply(msg);
  },
};
