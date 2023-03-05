const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('🎶 Musik | Siehe alle Songs in der Warteschlange'),

    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)
        if(!queue || ! queue.playing) {
            return await interaction.reply("Momentan spielen keine Songs")
        }

        let totalPages = 1;
        const page = (interaction.options.getNumber("page") || 1) - 1
        if(queue.tracks.length > 10) totalPages = 2
        if(queue.tracks.length > 20) totalPages = 3

        if(page > totalPages) 
            return await interaction.reply(`Falsche Seite! Es gibt nur ${totalPages} Seiten.`)

        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n")

        const currentSong = queue.current

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setDescription(`**Aktueller Song**\n` + 
                (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                `\n\n**Playlist**\n${queueString}`
                )
                .setFooter({
                    text: `Page ${page +1}/${totalPages}`
                })
                .setThumbnail(currentSong.thumbnail)
            ]
        })

    }
}