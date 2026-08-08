import { handleListCommand } from "./handlers/list-command.mjs";
import { handleSubscribeCommand } from "./handlers/subscribe-command.mjs";
import { handleUnsubscribeCommand } from "./handlers/unsubscribe-command.mjs";
import { editOriginalInteractionResponse } from "./utils/discord-api.mjs";
import { getDiscordSecrets } from "./utils/secrets.mjs";

const COMMANDS = {
  list: handleListCommand,
  subscribe: handleSubscribeCommand,
  unsubscribe: handleUnsubscribeCommand,
};

/**
 * Runs the actual work for a deferred interaction and edits the original
 * response. Invoked asynchronously by discord-interaction.
 *
 * The interaction token is valid for 15 minutes, so there is no 3 second
 * budget here — but the original response MUST be edited on every path,
 * otherwise the user is left staring at "考え中...".
 *
 * @param {Object} interaction - Discord interaction object
 */
export const handler = async (interaction) => {
  const { name } = interaction.data;
  console.log({ command: name, guildId: interaction.guild_id });

  let data;
  try {
    const command = COMMANDS[name];
    data = command
      ? await command(interaction)
      : { content: "Unknown command." };
  } catch (error) {
    console.error(`Error processing command ${name}:`, error);
    data = { content: "An error occurred. Please try again later." };
  }

  const { applicationId } = await getDiscordSecrets();
  const result = await editOriginalInteractionResponse(
    applicationId,
    interaction.token,
    data,
  );

  if (result.ok) return;

  const detail = `${result.status} ${JSON.stringify(result.body ?? {})}`;
  // 4xx (token 失効など) はリトライしても直らないので握る。
  // ネットワーク断や 5xx のみ throw して Lambda の非同期リトライに乗せる。
  if (result.status >= 400 && result.status < 500) {
    console.error(`Failed to edit interaction response: ${detail}`);
    return;
  }
  throw new Error(`Failed to edit interaction response: ${detail}`);
};
