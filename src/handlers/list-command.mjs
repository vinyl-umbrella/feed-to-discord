import { DISCORD } from "../constants.mjs";
import { FeedSubscriptionService } from "../services/feed-subscription.mjs";

/**
 * Join feed lines without exceeding Discord's message length limit.
 * 超過すると Discord が 400 を返し、ユーザーには何も表示されない。
 * @param {string} title
 * @param {Array<string>} lines
 * @returns {string}
 */
function buildContent(title, lines) {
  const content = [title, ...lines].join("\n");
  if (content.length <= DISCORD.MAX_CONTENT_LENGTH) {
    return content;
  }

  // 収まる分だけ載せ、省略した件数を末尾に添える
  const suffixFor = (omitted) => `\n...and ${omitted} more`;
  let used = title.length;
  const kept = [];

  for (const [i, line] of lines.entries()) {
    const remaining = lines.length - i;
    if (
      used + 1 + line.length + suffixFor(remaining - 1).length >
      DISCORD.MAX_CONTENT_LENGTH
    ) {
      break;
    }
    used += 1 + line.length;
    kept.push(line);
  }

  const omitted = lines.length - kept.length;
  return [title, ...kept].join("\n") + (omitted > 0 ? suffixFor(omitted) : "");
}

/**
 * `/list`, `/list all True`
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<Object>} - Response data
 */
export async function handleListCommand(interaction) {
  const feedService = new FeedSubscriptionService();
  const channelId = interaction.channel_id;
  const guildId = interaction.guild_id;
  const options = interaction.data.options || [];

  const showAll = options.find((opt) => opt.name === "all")?.value;

  const feeds = showAll
    ? await feedService.getFeedsByGuild(guildId)
    : await feedService.getFeedsByChannel(channelId);

  if (feeds.length === 0) {
    return {
      content: showAll
        ? "No feeds in this server."
        : "No feeds in this channel.",
    };
  }

  const lines = feeds.map(
    (item) => `- [${item.feedTitle || "No Title"}](${item.feedUrl})`,
  );
  const title = showAll
    ? "Subscribed RSS Feeds in this Server:"
    : "Subscribed RSS Feeds in this Channel:";

  return { content: buildContent(title, lines) };
}
