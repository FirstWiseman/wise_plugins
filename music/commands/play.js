const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js')
const { QueryType, Queue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('🎶 Musik System | Spiele Musik')
    .addStringOption((option) => 
        option
            .setName('song')
            .setDescription('Song Name | Url ')
            .setRequired(true)
    ),

    run: async({ client, interaction }) => {
        const requestedSong = interaction.options.getString("song");
        const voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) return await interaction.reply({
            content: ':x: | Du musst in einem Voice Channel Sein.',
            ephemeral: true
        });

        let queue = client.player.getQueue(interaction.guild)
        if(!queue) queue = await client.player.createQueue(interaction.guild, { leaveOnEnd: false, leaveOnEmpty: true, leaveOnEmptyCooldown: 30000 })
        if(!queue.connection) await queue.connect(interaction.member.voice.channel);


        const results = await client.player.search(requestedSong, {
            searchEngine: QueryType.AUTO,
            requestedBy: interaction.user
        });

        if(results.tracks.length < 1) return await interaction.reply({
            content: `:x: | Ich konnte nix zu **${requestedSong}** finden`,
            ephemeral: true
        });

        const song = results.tracks[0];
        if(!song) return await interaction.reply({content: `:x: | Ich konnte nix zu **${requestedSong}** finden`, ephemeral: true})
        console.log(song.title, song.url)

        await queue.addTrack(song);

        const embed = new EmbedBuilder()
        .setThumbnail(interaction.guild.iconURL())
        .setTitle(song.title)
        .setImage(song.thumbnail)
        .setFooter({ text: `Angefragt von: ${interaction.user.username}` })

        if(!queue.playing) {
            await interaction.deferReply()
            await queue.play();
            embed.setDescription(`Spielt **[${song.title}](${song.url})**\n\nDauer: ${song.duration}`)
            return await interaction.editReply({  embeds: [embed]  }).catch(err => {});
        }else {
            embed.setDescription(`**[${song.title}](${song.url})** wurde zur Playlist hinzugefügt\n\nDauer: ${song.duration}`)
        }
        await interaction.reply({  embeds: [embed]  }).catch(err => {});
    }
}