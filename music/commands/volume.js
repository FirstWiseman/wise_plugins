const { SlashCommandBuilder } = require('@discordjs/builders')
const { entersState } = require('@discordjs/voice')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('🎶 Musik | Ändere die Lautstärke eines Songs.')
        .addNumberOption((option) => option.setName("volume").setDescription("Numver").setRequired(true)),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);
        if (!queue && !queue.playing) return await interaction.reply({ content: ":x: | Es spielt keine Musik!" });
        const vol = interaction.options.getNumber('volume');

        await queue.setVolume(vol);
        return await interaction.reply('🔊 | Ich habe die Lautstärke auf ' + vol + '% gesetzt.');
    }
}
