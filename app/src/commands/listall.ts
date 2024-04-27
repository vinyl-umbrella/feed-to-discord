import { AppDataSource } from '../data-source';
import { Feed } from '../models/feed';
import { Notification } from '../models/notification';
import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import { logger } from '../util/logger';
import { sendSplittedMsg } from '../util/djs-helper';

export default {
  data: new SlashCommandBuilder().setName('listall').setDescription('list feeds in this server'),

  async execute(interaction: CommandInteraction) {
    logger.info(`${interaction.guildId} /listall`);
    const serverId = interaction.guildId!;

    const result = await AppDataSource.createQueryBuilder(Feed, 'feed')
      .select(['feed.feed_url', 'notification.channel_id'])
      .innerJoin(Notification, 'notification', 'feed.uuid = notification.feed_id')
      .where('notification.server_id = :serverId', { serverId })
      .getRawMany();

    let msg = result.map((i) => `<#${i.notification_channel_id}> ${i.feed_feed_url}`).join('\n');
    if (msg === '') {
      msg = 'このサーバには何も登録されていません';
    }

    if (msg.length > 2000) {
      await interaction.reply('-------- very long msg --------');
      await sendSplittedMsg(interaction.channel!, msg);
      return;
    }

    await interaction.reply(msg);
  },
};
