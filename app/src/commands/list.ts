import { AppDataSource } from '../data-source';
import { Feed } from '../models/feed';
import { Notification } from '../models/notification';
import {
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
  TextChannel,
  type CommandInteraction,
} from 'discord.js';
import { logger } from '../util/logger';
import { sendSplittedMsg } from '../util/djs-helper';

export default {
  data: new SlashCommandBuilder().setName('list').setDescription('list feeds in this channel'),

  async execute(interaction: CommandInteraction) {
    logger.info(`${interaction.guildId} /list`);
    let channelId: string = interaction.channelId;

    // if call from thread
    if (interaction.channel!.type === 11) {
    }

    const feeds = await AppDataSource.createQueryBuilder(Feed, 'feed')
      .leftJoin(Notification, 'notification', 'feed.uuid = notification.feed_id')
      .where('notification.channel_id = :channelId', { channelId })
      .getMany();

    let msg = feeds.map((feed) => feed.feed_url).join('\n');
    if (msg === '') {
      msg = 'このチャンネルには何も登録されていません';
    }

    if (msg.length > 2000) {
      await interaction.reply('-------- very long msg --------');
      await sendSplittedMsg(interaction.channel!, msg);
      return;
    }

    await interaction.reply(msg);
  },
};
