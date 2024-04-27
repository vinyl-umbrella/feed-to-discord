import {
  SlashCommandBuilder,
  type Collection,
  type CommandInteraction,
  type SlashCommandStringOption,
  type ThreadChannel,
  type TextChannel,
  type Webhook,
} from 'discord.js';
import { AppDataSource } from '../data-source';
import { canParseRSS } from '../util/scrape-helper';
import { Feed } from '../models/feed';
import { Notification } from '../models/notification';
import { logger } from '../util/logger';

async function registerFeed(
  feedUrl: string,
  serverId: string,
  channelId: string,
  webhookUrl: string,
): Promise<void> {
  // check if feed is already registered
  let feedData = await AppDataSource.getRepository(Feed).findOne({ where: { feed_url: feedUrl } });
  // if not, insert to feed table
  if (!feedData) {
    feedData = await AppDataSource.getRepository(Feed).save({ feed_url: feedUrl });
  }

  AppDataSource.getRepository(Notification).save({
    feed_id: feedData.uuid,
    server_id: serverId,
    channel_id: channelId,
    webhook_url: webhookUrl,
  });

  // 3. insert to notification table
}

// get destination channel and its webhook url
async function getDestination(
  interaction: CommandInteraction,
): Promise<{ webhookUrl: string; channelId: string }> {
  const channelId = interaction.channelId;
  const parentChannel: TextChannel | null =
    interaction.channel!.type === 11
      ? ((interaction.channel as ThreadChannel).parent as TextChannel)
      : null;
  let isThread = false;
  let webhookCollection: Collection<string, Webhook>;
  let webhookUrl: String;

  if (interaction.channel!.type === 11) {
    // if called from thread, get parent channel's webhook
    isThread = true;
    webhookCollection = await parentChannel!.fetchWebhooks();
  } else {
    // if called from channel, get channel's webhook
    webhookCollection = await (interaction.channel as TextChannel).fetchWebhooks();
  }

  // check if webhook is already created by this bot
  if (webhookCollection.filter((hook) => hook.owner!.id === interaction.client.user.id).size > 0) {
    // get the webhook url
    webhookUrl = webhookCollection.first()!.url;
  } else {
    // if not, create new webhook
    let hook = null;
    if (isThread) {
      // create webhook in parent channel
      hook = await parentChannel!.createWebhook({
        name: `f2d_${parentChannel!.id}`,
      });
    } else {
      hook = await (interaction.channel as TextChannel)!.createWebhook({
        name: `f2d_${channelId}`,
      });
    }
    webhookUrl = hook.url;
  }

  if (isThread) {
    webhookUrl += `?thread_id=${channelId}`;
  }
  return { webhookUrl: webhookUrl.toString(), channelId: channelId };
}

export async function alreadySubscribed(feedUrl: string, serverId: string): Promise<string> {
  const channel = await AppDataSource.createQueryBuilder(Feed, 'feed')
    .select('notification.channel_id')
    .leftJoin(Notification, 'notification', 'feed.uuid = notification.feed_id')
    .where('notification.server_id = :serverId', { serverId })
    .andWhere('feed.feed_url = :feedUrl', { feedUrl })
    .getRawOne();

  if (!channel) {
    return '';
  }
  return channel.notification_channel_id;
}

export default {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('subscribe feed which you enter')
    .addStringOption((opt: SlashCommandStringOption) =>
      opt.setName('url').setDescription('url').setRequired(true),
    ),

  async execute(interaction: CommandInteraction) {
    const feedUrl = String(interaction.options.get('url')?.value);
    logger.info(`${interaction.guildId} /subscribe ${feedUrl}`);

    // validate url
    if (!(await canParseRSS(feedUrl))) {
      await interaction.reply({ content: '入力されたURLが正しくありません', ephemeral: true });
      return;
    }

    // check if already subscribed
    const subscribedChannel = await alreadySubscribed(feedUrl, interaction.guildId!);

    if (subscribedChannel !== '') {
      await interaction.reply({
        content: `${feedUrl} は すでに <#${subscribedChannel}> に登録されています`,
        ephemeral: true,
      });
      return;
    }

    // get destination channel and its webhook url
    const { webhookUrl, channelId } = await getDestination(interaction);

    await registerFeed(feedUrl, interaction.guildId!, channelId, webhookUrl);

    await interaction.reply({ content: `${feedUrl} を登録しました` });
  },
};
