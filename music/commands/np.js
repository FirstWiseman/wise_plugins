const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('🎶 Musik | Bekomme Informationen über den Aktuellen Song.'),
    run: async({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);
        if(!queue) return await interaction.reply('Aktuell spielt keine Musik.')

        const song = queue.current;
        if(!song) return await interaction.reply('Aktuell spielt keine Musik.')

        const bar = queue.createProgressBar({
            client: client,
            lenght: 19
        })

        const ProgressArray = queue.getPlayerTimestamp()

        var filter = queue.getFiltersEnabled()

        if(!filter.length){
            filter = 'Keine Filter'
        }

        const embed = new EmbedBuilder()
        .setTitle('📻 | Now Playing')
        .setDescription(

            `🎶 Song: **${song.title}**\n👤 Creator: **${song.author}**\n🔊 Lautstärke: **${queue.volume}%**\n🎚️ Filter: **${filter}**\n🪧 Channel: **${client.channels.cache.get(queue.connection.channel.id).name}**`
        )
        .addFields(
            { 
                name: '⌚ | Timestamp',
                value: ProgressArray.current+'/'+ProgressArray.end+'\n\n'+bar,
                inline: true
            },
            {
                name: '🎧 | DJ',
                value: `Tag: ${song.requestedBy.tag}\nID: ${song.requestedBy.id}\nUser: <@${song.requestedBy.id}>`,
                inline: true
            }
        )
        .setTimestamp()
        .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
        .setThumbnail(queue.current.thumbnail)
        .setFooter({ text: '@2022 Wisescripts' })

        interaction.reply({
            embeds: [embed]
        });
    }
}