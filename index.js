const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token, openAIKey, openAIOrg } = require('./config.json');

// connect to Discord API. make intents known.
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// set up OpenAI API
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	organization: openAIOrg,
	apiKey: openAIKey,
});

const openAI = new OpenAIApi(configuration);

// check for messages
client.on('messageCreate', async function (message) {
	try {
		// don't speak to other bots
		if (message.author.bot) return;

		const marvinResponse = await openAI.createCompletion({
			model: 'gpt-3.5-turbo',
			prompt: `MarvinBot is a bored chatbot that knows how to answer people with a deadpan sense of humor and lots of helpful information.\n
			  You: Hello, MarvinBot, this is so cool!\n
				Marvin: hello, I presume you want to chat?\n
				${message.author.username}: ${message.content}\n
				MarvinBot:`,
			temperature: 0.7,
			max_tokens: 100,
			frequency_penalty: 0.5,
			presence_penalty: 0.0,
		});

		const channel = client.channels.cache.get(message.channelId);
		channel.send(`${marvinResponse.data.choices[0].text}`);
	} catch (err) {
		console.log(err);
	}
});
// set up collection of commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
