const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('🎶 Musik | Skippe einen Song'),
    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guild);
        
        if(!queue) 
            return interaction.reply(":x: | Es befinden sich keine Songs in der Playlist")

            let song = queue.current

            if(client.player.getQueue(interaction.guild).connection.paused){
                if(queue) queue.stop()
                if(queue) queue.destroy()

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder() .setTitle('🎧 | Erfolgreich!') .setDescription(`**[${song.title}](${song.url})** gestoppt`) .setThumbnail(song.thumbnail)
                    ]
                })
            } 

            queue.skip()
            await interaction.deferReply()
            // queue.setPaused(false)
            // queue.connection.paused = false
            await queue.play()
            await new Promise(res => setTimeout(res, 3000))

            if(client.player.getQueue(interaction.guild).connection.paused || !queue.current){
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder() .setTitle('🎧 | Erfolgreich!') .setDescription(`**[${song.title}](${song.url})** wurde pausiert`) .setThumbnail(song.thumbnail)
                    ]
                })
            }

            song = queue.current
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder() .setTitle('🎧 | Erfolgreich!') .setDescription(`Spielt **[${song.title}](${song.url})**`) .setThumbnail(song.thumbnail)
                ]
            })
    },
}