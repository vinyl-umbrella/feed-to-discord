import {
  ApplicationCommandDataResolvable,
  Client,
  Collection,
  Events,
  Interaction,
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './command';
import { logger } from '../util/logger';

export class Bot {
  public commands = new Collection<string, Command>();
  public slashCommands = new Array<ApplicationCommandDataResolvable>();
  public slashCommandsMap = new Map<string, Command>();

  public constructor(public readonly client: Client) {
    this.client.login(process.env.TOKEN);

    this.client.on('ready', async () => {
      await this.registerCommands();
      logger.info(`${this.client.user!.tag} ready!!`);
    });

    this.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      await this.execCommand(interaction);
    });
  }

  /*
   * Register all commands in `src/commands/`
   */
  private async registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

    // read all command files
    const commandFiles = readdirSync(join(__dirname, '..', 'commands')).filter(
      (file) => !file.endsWith('.ts'),
    );

    for (const file of commandFiles) {
      const command = await import(join(__dirname, '..', 'commands', `${file}`));

      this.slashCommands.push(command.default.data);
      this.slashCommandsMap.set(command.default.data.name, command.default);
    }

    // register all commands
    await rest.put(Routes.applicationCommands(this.client.user!.id), {
      body: this.slashCommands,
    });
  }

  /*
   * Execute command
   */
  private async execCommand(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = this.slashCommandsMap.get(interaction.commandName);
    if (!command) {
      logger.warn(`command ${interaction.commandName} not found`);
      return;
    }

    await command.execute(interaction).catch((err: any) => logger.error(err));
  }
}
