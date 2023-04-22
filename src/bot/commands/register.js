const { SlashCommandBuilder } = require('discord.js');
const { registerFeed } = require('../sql/query.js');

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
    // TODO: nameをRSS_チャンネルIDにしたい
    const hook = await interaction.channel.createWebhook({
      name: 'RSS',
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
    // TODO: 登録処理
    // まずURLが正しいか確認
    // (URLが正しいかどうかは，RSSを取得してみて，エラーが出ないかで判断する)
    // 次に，既にそのサーバで登録されていないか確認
    //   既に登録されていたら，エラーを返す

    const Hook = await getWebhookUrl(interaction);
    try {
      // DBに挿入する
      registerFeed(
        interaction.options.getString('url'),
        Hook.hookUrl,
        interaction.guildId,
        Hook.channelId,
        Hook.threadId,
      );
    } catch (e) {
      await interaction.reply('登録処理に失敗しました', { ephemeral: true });
      // console.warn(e);
      return;
    }

    // 登録完了を返す
    await interaction.reply(
      `登録しました: ${interaction.options.getString('url')}`,
      { ephemeral: false },
    );
  },
};
