const { SlashCommandBuilder } = require('discord.js');
const { registerFeed, selectByUrlServer } = require('../sql/query.js');
const { canParseRSS } = require('../util/scrape-helper.js');
const { log } = require('../util/log.js');

getWebhookUrl = async (interaction) => {
  let channelId = interaction.channelId;
  let threadId = null;
  let hooks = null;
  let hookUrl = null;

  // スレッドから呼ばれた場合
  // 親のチャンネルのID, スレッドのID, 親のwebhookを取得
  if (interaction.channel.type === 11) {
    channelId = null;
    threadId = interaction.channelId;
    hooks = await interaction.channel.parent.fetchWebhooks();
  } else {
    hooks = await interaction.channel.fetchWebhooks();
  }

  // そのチャンネルIDにF2Dが作成したwebhookがあるか？
  if (
    hooks.filter((hook) => hook.owner.id === interaction.client.user.id).size >
    0
  ) {
    // ある場合，そのwebhookのURLを取得
    hookUrl = hooks.first().url;
  } else {
    // ない場合，webhookを作成して，そのURLを取得
    const hook = await interaction.channel.createWebhook({
      name: `RSS_${interaction.channelId}`,
      reason: 'F2D bot',
    });
    hookUrl = hook.url;
  }

  // もしスレッドから呼ばれた場合
  // hookにthread_idを追加する
  if (threadId) {
    hookUrl += `?thread_id=${threadId}`;
  }
  return { hookUrl: hookUrl, channelId: channelId, threadId: threadId };
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('購読するRSSを登録する')
    .addStringOption((option) =>
      option.setName('url').setDescription('RSSのURL').setRequired(true),
    ),
  // TODO: オプションを追加する．(頻度), (favicon)
  async execute(interaction) {
    log(
      'INFO',
      `${interaction.guildId} /register ${interaction.options.getString(
        'url',
      )}`,
    );
    const inputUrl = interaction.options.getString('url');
    // まずURLが正しいか確認
    const canParse = await canParseRSS(inputUrl);
    if (!canParse) {
      await interaction.reply('入力されたURLが正しくありません', {
        ephemeral: true,
      });
      return;
    }

    // 次に，既にそのサーバで登録されていないか確認
    const alreadyRegistered = await selectByUrlServer(
      inputUrl,
      interaction.guildId,
    );
    if (alreadyRegistered.length > 0) {
      let dest = alreadyRegistered[0].channel_id
        ? alreadyRegistered[0].channel_id
        : alreadyRegistered[0].thread_id;
      await interaction.reply(`${inputUrl} は <#${dest}>に登録されています`, {
        ephemeral: true,
      });
      return;
    }

    const Hook = await getWebhookUrl(interaction);
    try {
      // DBに挿入する
      registerFeed(
        inputUrl,
        Hook.hookUrl,
        interaction.guildId,
        Hook.channelId,
        Hook.threadId,
      );
    } catch (e) {
      await interaction.reply('登録処理に失敗しました', { ephemeral: true });
      log('WARN', `/register ${e}`);
      return;
    }

    // 登録完了を返す
    await interaction.reply(`登録しました: ${inputUrl}`, { ephemeral: false });
  },
};
