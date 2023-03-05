const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const { QueryType, Queue } = require('discord-player');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('🎶 Musik System | Tritt deinem Kanal bei'),

    run: async({ client, interaction }) => {
        const voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) return await interaction.reply({
            content: ':x: | Du musst in einem Voice Channel Sein.',
            ephemeral: true
        });
        let queue = client.player.getQueue(interaction.guild)
        if(!queue) queue = client.player.createQueue(interaction.guild, { leaveOnEnd: false, leaveOnEmpty: true, leaveOnEmptyCooldown: 30000 })
        await queue.connect(voiceChannel)


        await interaction.reply({
            content: `✅ | Ist <#${voiceChannel.id}> beigetreten`,
            ephemeral: true
        });
    }
}