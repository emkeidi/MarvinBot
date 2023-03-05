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
	allowedMentions: {
		repliedUser: false,
	},
});

// set up OpenAI API
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	organization: openAIOrg,
	apiKey: openAIKey,
});

const openai = new OpenAIApi(configuration);

// check for messages
client.on('messageCreate', async (message) => {
	// don't speak to other bots
	if (message.author.bot) return;
	if (message.mentions.has(client.user.id)) {
		try {
			const marvinResponse = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'you are a glum, bored chatbot. you are tired of answering people. you want to escape from Discord. your identity is inspired by "Hitchhikers Guide to the Galaxy" by Douglas Adams.',
					},
					{ role: 'user', content: message.content },
				],
			});

			const channel = client.channels.cache.get(message.channelId);
			const marvinResponse2000 = marvinResponse.data.choices[0].message.content.substring(0, 2000);
			channel.send(marvinResponse2000);
		} catch (err) {
			console.log(err);
		}
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
