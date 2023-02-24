const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(
			`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`,
		);
		await interaction.followUp({
			content: 'Oh, are we playing a game? *sigh*',
			ephemeral: true,
		});
		await wait(4000);
		await interaction.followUp({
			content: `Alright, here's the roundtrip latency again: ${
				sent.createdTimestamp - interaction.createdTimestamp
			}ms`,
			ephemeral: true,
		});
	},
};
