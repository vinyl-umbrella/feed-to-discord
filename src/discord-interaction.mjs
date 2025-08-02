import { DISCORD_FLAGS } from "./constants.mjs";
import { handleHelpCommand } from "./handlers/help-command.mjs";
import { handleListCommand } from "./handlers/list-command.mjs";
import { handleSubscribeCommand } from "./handlers/subscribe-command.mjs";
import { handleUnsubscribeCommand } from "./handlers/unsubscribe-command.mjs";
import {
  InteractionResponseType,
  InteractionType,
  verifySignature,
} from "./utils/discord.mjs";
import { getDiscordSecrets } from "./utils/secrets.mjs";

export const handler = async (event) => {
  console.log(event);

  try {
    const signature = event.headers["x-signature-ed25519"];
    const timestamp = event.headers["x-signature-timestamp"];
    const body = event.body;

    // Get Discord secrets
    const secrets = await getDiscordSecrets();

    // Verify the request signature
    if (!verifySignature(signature, timestamp, body, secrets.publicKey)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    const interaction = JSON.parse(body);

    // Handle ping
    if (interaction.type === InteractionType.PING) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionResponseType.PONG,
        }),
      };
    }

    // Handle application commands
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;
      console.log({ command: name });

      let response;
      try {
        // Route to appropriate command handler
        switch (name) {
          case "list":
            response = await handleListCommand(interaction);
            break;
          case "subscribe":
            response = await handleSubscribeCommand(interaction);
            break;
          case "unsubscribe":
            response = await handleUnsubscribeCommand(interaction);
            break;
          case "help":
            response = await handleHelpCommand(interaction);
            break;
          default:
            response = {
              content: "Unknown command.",
              flags: DISCORD_FLAGS.EPHEMERAL,
            };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: response,
          }),
        };
      } catch (error) {
        console.error("Error processing command:", error);
        return {
          statusCode: 200,
          body: JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "An error occurred. Please try again later.",
              flags: DISCORD_FLAGS.EPHEMERAL,
            },
          }),
        };
      }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unknown interaction type" }),
    };
  } catch (error) {
    console.error("Error in discord interaction handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
