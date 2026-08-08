import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { DISCORD_FLAGS } from "./constants.mjs";
import { handleHelpCommand } from "./handlers/help-command.mjs";
import {
  getHeader,
  InteractionResponseType,
  InteractionType,
  verifySignature,
} from "./utils/discord.mjs";

const lambda = new LambdaClient();
const WORKER_FUNCTION = process.env.INTERACTION_WORKER_FUNCTION;
// 公開鍵は秘密情報ではない (Developer Portal に平文で表示される)。
// 環境変数に置くことで、応答を返すまでに AWS API を一切呼ばずに済ませる。
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// Discord は 3 秒以内の応答を要求するため、この関数では I/O をほぼ行わない。
// 重い処理 (RSS 取得や DynamoDB 更新) は interaction-worker に非同期で委譲する。
//
// defer した時点で ephemeral かどうかが確定し、後から変更できない。
// 購読操作は本人にだけ見せ、`/list` の結果はチャンネルに公開する。
const EPHEMERAL_COMMANDS = new Set(["subscribe", "unsubscribe"]);

// 委譲せずこの場で答えられるコマンド (外部 I/O が不要なもの)
const IMMEDIATE_COMMANDS = {
  help: handleHelpCommand,
};

/**
 * Build an API Gateway response carrying a Discord interaction response.
 * @param {number} type - InteractionResponseType
 * @param {Object} [data] - Discord message data
 * @returns {Object}
 */
function interactionResponse(type, data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ? { type, data } : { type }),
  };
}

export const handler = async (event) => {
  try {
    // NOTE: interaction token は 15 分間アプリとして発言できるため、
    // event 全体をログに出さない。
    const body = event.body;

    const isVerified = verifySignature(
      getHeader(event.headers, "x-signature-ed25519"),
      getHeader(event.headers, "x-signature-timestamp"),
      body,
      PUBLIC_KEY,
    );
    if (!isVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    const interaction = JSON.parse(body);

    if (interaction.type === InteractionType.PING) {
      return interactionResponse(InteractionResponseType.PONG);
    }

    if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Unknown interaction type" }),
      };
    }

    const { name } = interaction.data;
    console.log({ command: name, guildId: interaction.guild_id });

    const immediate = IMMEDIATE_COMMANDS[name];
    if (immediate) {
      return interactionResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        immediate(interaction),
      );
    }

    // 実処理はワーカーに投げ、結果は interaction token 経由で後から返す
    await lambda.send(
      new InvokeCommand({
        FunctionName: WORKER_FUNCTION,
        InvocationType: "Event",
        Payload: JSON.stringify(interaction),
      }),
    );

    return interactionResponse(
      InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      EPHEMERAL_COMMANDS.has(name) ? { flags: DISCORD_FLAGS.EPHEMERAL } : {},
    );
  } catch (error) {
    console.error("Error in discord interaction handler:", error);
    // ワーカーの起動に失敗した場合など。ここで 5xx を返すと Discord 側は
    // 「応答しませんでした」になるため、エラー内容をユーザーに見せる。
    return interactionResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      {
        content: "An error occurred. Please try again later.",
        flags: DISCORD_FLAGS.EPHEMERAL,
      },
    );
  }
};
