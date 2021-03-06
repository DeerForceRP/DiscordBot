require("dotenv").config();
const keepAlive = require("./server");
const {
	Client,
	Collection,
	Intents
} = require("discord.js");
const client = new Client({
	intents: [Intents.FLAGS.GUILDS]
});

client.commands = new Collection();
client.aliases = new Collection();

['command', 'event'].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

keepAlive();
client.login(process.env.BOT_TOKEN);