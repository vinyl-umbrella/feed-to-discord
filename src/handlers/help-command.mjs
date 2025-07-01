import { DISCORD_FLAGS } from "../constants.mjs";

/**
 * `/help`
 * @param {Object} interaction - Discord interaction object
 * @returns {Promise<Object>} - Response data
 */
export async function handleHelpCommand(interaction) {
  return {
    content: `
\`/list\` - list RSS feeds in this channel
\`/list all\` - list RSS feeds subscribed to in all channels of this server
\`/subscribe <URL>\` - subscribe to the RSS feed at the specified URL
\`/unsubscribe <URL>\` - unsubscribe from the RSS feed at the specified URL
\`/help\` - show command for this bot`,
  };
}

export const handler = async (event) => {
  console.log("Help command received:", JSON.stringify(event, null, 2));

  try {
    return await handleHelpCommand(event);
  } catch (error) {
    console.error("Error in help command handler:", error);
    return {
      content: "An error occurred. Please try again later.",
      flags: DISCORD_FLAGS.EPHEMERAL,
    };
  }
};
