import { type EntityManager } from 'typeorm';
import { AppDataSource } from './data-source';
import { Bot } from './discord/bot';
import { Client, GatewayIntentBits } from 'discord.js';
import { logger } from './util/logger';
import { scrape } from './scrape';

async function initDB(): Promise<EntityManager> {
  await AppDataSource.initialize();
  return AppDataSource.manager;
}

/*
 * scrape every 10 minutes
 */
async function main() {
  // init db
  await initDB();

  // scrape
  while (true) {
    await scrape();
    await new Promise((resolve) => setTimeout(resolve, 600000));
  }
}

// launch a bot
const bot = new Bot(
  new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildWebhooks],
  }),
);

main().catch((error) => logger.error(error));

export { bot };
