const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(
			`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`,
		);
		// await wait(1000);
		// await interaction.followUp({
		// 	content: 'Oh, are we playing a game? *sigh*',
		// 	ephemeral: true,
		// });
		// await wait(2000);
		// await interaction.followUp({
		// 	content: `Alright, here's the roundtrip latency again since you care so much: ${
		// 		sent.createdTimestamp - interaction.createdTimestamp
		// 	}ms.`,
		// 	ephemeral: true,
		// });
	},
};
