import { REST, Routes } from 'discord.js';

// Discord アプリケーションの設定
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_APPLICATION_ID) {
    console.error('DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID environment variables are required');
    process.exit(1);
}

// コマンド定義
const commands = [
    {
        name: 'list',
        description: 'Show subscribed RSS feeds',
        options: [
            {
                name: 'all',
                description: 'Show all RSS feeds in the server',
                type: 5, // BOOLEAN
                required: false
            }
        ]
    },
    {
        name: 'subscribe',
        description: 'Subscribe to an RSS feed',
        options: [
            {
                name: 'url',
                description: 'The URL of the RSS feed to subscribe to',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'unsubscribe',
        description: 'Unsubscribe from an RSS feed',
        options: [
            {
                name: 'url',
                description: 'The URL of the RSS feed to unsubscribe from',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'help',
        description: 'Show help message'
    }
];

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(DISCORD_APPLICATION_ID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
        console.log('Registered commands:');
        commands.forEach(cmd => {
            console.log({name: cmd.name, description: cmd.description});
        });
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}


registerCommands();
