const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { log } = require('./util/log');
const { scrape } = require('./scrape');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildWebhooks],
});
client.commands = new Collection();

// プログラム起動時，コマンドのセットアップ
client.on('ready', async () => {
  // commandsディレクトリ以下のコマンドを読み込み，ファイル名を返す
  function getCommands() {
    const cPath = path.join(__dirname, './commands');
    let commandFiles = [];
    fs.readdirSync(cPath)
      .filter((filename) => filename.endsWith('.js'))
      .forEach((filename) => {
        commandFiles.push(path.join(cPath, filename));
      });

    return commandFiles;
  }

  const commandFiles = getCommands();
  const commandsArr = [];

  // コマンドを読み込み
  for (let commandProg of commandFiles) {
    const command = require(commandProg);
    client.commands.set(command.data.name, command);

    commandsArr.push(command.data.toJSON());
  }

  // コマンドを登録
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  // FIXME: Routes.applicationGuildCommands(client.user.id, guildId)にしたほうがいいかも
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: commandsArr,
  });

  log('INFO', "I'm ready!");
});

// スラッシュコマンドを実行
client.on(Events.InteractionCreate, async (interraction) => {
  if (!interraction.isCommand()) return;

  const command = interraction.client.commands.get(interraction.commandName);
  if (!command) log('ERROR', `Command ${interraction.commandName} not found`);

  try {
    await command.execute(interraction);
  } catch (e) {
    log('ERROR', e);
  }
});

client.login(process.env.TOKEN);

// 10minごとにスクレイピング
while (true) {
  await scrape();
  await new Promise((resolve) => setTimeout(resolve, 600000));
}
