import { Client, GatewayIntentBits } from "discord.js";
import { FeedSubscriptionService } from "./services/feed-subscription.mjs";
import { DISCORD_ERROR_CODES } from "./constants.mjs";
import { getDiscordSecrets } from "./utils/secrets.mjs";

export const handler = async (event) => {
  console.log("Received EventBridge event:", JSON.stringify(event, null, 2));

  try {
    const eventDetail = event.detail;
    const { feedUrl, feedTitle, item } = eventDetail;

    // Get Discord secrets
    const secrets = await getDiscordSecrets();

    // Get all channels subscribed to this feed using the service
    const feedService = new FeedSubscriptionService();
    const subscriptions = await feedService.getChannelsByFeed(feedUrl);

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for feed: ${feedUrl}`);
      return { statusCode: 200 };
    }

    // Create Discord client
    const discordClient = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    await discordClient.login(secrets.botToken);

    // Format the message
    const message = `${feedTitle}\n[${item.title || "No Title"}](${item.link || ""})`;

    // Send message to each subscribed channel
    const sendPromises = subscriptions.map((subscription) =>
      sendToChannel(discordClient, subscription.channelId, message),
    );

    await Promise.allSettled(sendPromises);

    discordClient.destroy();

    console.log(`Sent message to ${subscriptions.length} channels`);
    return { statusCode: 200 };
  } catch (error) {
    console.error("Error in discord poster:", error);
    return { statusCode: 500, error: error.message };
  }
};

async function sendToChannel(client, channelId, message) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.warn(`Channel not found: ${channelId}`);
      return;
    }

    await channel.send({ content: message });

    console.log(`Message sent to channel: ${channelId}`);
  } catch (error) {
    console.error(`Error sending message to channel ${channelId}:`, error);

    // If it's a permission error or channel not found, we might want to remove the subscription
    if (
      error.code === DISCORD_ERROR_CODES.MISSING_PERMISSIONS ||
      error.code === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL
    ) {
      console.log(`Removing invalid subscription for channel: ${channelId}`);
      // NOTE: In a production environment, you might want to remove the subscription from DynamoDB
    }
  }
}
