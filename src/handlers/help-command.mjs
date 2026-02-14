export const handler = async (_event) => {
  return {
    content: `
\`/list\` - list RSS feeds in this channel
\`/list all\` - list RSS feeds subscribed to in all channels of this server
\`/subscribe <URL>\` - subscribe to the RSS feed at the specified URL
\`/unsubscribe <URL>\` - unsubscribe from the RSS feed at the specified URL
\`/help\` - show command for this bot`,
  };
};
