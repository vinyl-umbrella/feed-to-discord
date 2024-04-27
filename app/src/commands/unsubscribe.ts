import { AppDataSource } from '../data-source';
import { Feed } from '../models/feed';
import { Notification } from '../models/notification';
import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import { logger } from '../util/logger';
import { alreadySubscribed } from './subscribe';

/*
 * notificationから削除
 * if no notification has the same feed_id, delete feed
 */
async function deleteFeed(feedUrl: string, serverId: string): Promise<void> {
  const ids = await AppDataSource.createQueryBuilder(Notification, 'notification')
    .select(['notification.uuid', 'feed.uuid'])
    .innerJoin(Feed, 'feed', 'notification.feed_id = feed.uuid')
    .where('feed.feed_url = :feedUrl', { feedUrl })
    .andWhere('notification.server_id = :serverId', { serverId })
    .getRawOne();

  if (!ids) {
    logger.warn(`notification not found for ${feedUrl} in ${serverId}`);
    return;
  }

  // notificationから削除
  await AppDataSource.getRepository(Notification).delete(ids.notification_uuid);

  // feed_uuidを持つ他のnotificationが存在しない場合，feedから削除
  const count = await AppDataSource.getRepository(Notification).count({
    where: { feed_id: ids.feed_uuid },
  });

  if (count === 0) {
    await AppDataSource.getRepository(Feed).delete(ids.feed_uuid);
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('unsubscribe')
    .setDescription('unsubscribe feed which you enter')
    .addStringOption((option) => option.setName('url').setDescription('url').setRequired(true)),

  async execute(interaction: CommandInteraction) {
    const feedUrl = String(interaction.options.get('url')?.value);
    const serverId = interaction.guildId!;
    const channelId = interaction.channelId;

    logger.info(`${serverId} /unsubscribe ${feedUrl}`);

    // if not subscribing, send message
    const subscribedChannel = await alreadySubscribed(feedUrl, serverId);
    if (subscribedChannel === '') {
      await interaction.reply({
        content: `${feedUrl} は本サーバでは登録されていません`,
        ephemeral: true,
      });
      return;
    }

    await deleteFeed(feedUrl, channelId);
    await interaction.reply(`${feedUrl} を削除しました`);
  },
};
