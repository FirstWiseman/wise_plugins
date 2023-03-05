const { SlashCommandBuilder } = require("@discordjs/builders");
const { QueryType, AudioFilters } = require('discord-player');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('🎶 Musik | Suche einen Song.')
    .addStringOption((option) => option.setName('song').setDescription('Song Name').setRequired(true))
    .addIntegerOption((option) => option.setName('engine') .setDescription('Search Engine') 
    .addChoices(
        { name: '🚀 Spotify', value: 0},
        { name: '🚀 Soundcloud', value: 1 },
        { name: '🚀 Youtube', value: 2 }
    )
    .setRequired(true)
    ),

    run: async({ client, interaction }) => {

        let engine = null;

        if(interaction.options.get('engine').value == 0) engine = 'Spotify'
        if(interaction.options.get('engine').value == 1) engine = 'Soundcloud'
        if(interaction.options.get('engine').value == 2) engine = 'Youtube'

        var req = [];

        if(engine == null) {
            const data = interaction.options.getString('song');
            const result = await client.player.search(data, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if(result.tracks.length < 1) return;

            req.push(result.tracks[0]);
        } else if(engine == 'Spotify') {
            const data = interaction.options.getString('song');
            const result = await client.player.search(data, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG
            });

            if(result.tracks.length < 1) return;

            req.push(result.tracks[0]);
        } else if(engine == 'Soundcloud') {
            const data = interaction.options.getString('song');
            const result = await client.player.search(data, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SOUNDCLOUD
            });

            if(result.tracks.length < 1) return;

            req.push(result.tracks[0]);
        } else if(engine == 'Youtube') {
            const data = interaction.options.getString('song');
            const result = await client.player.search(data, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE
            });

            if(result.tracks.length < 1) return;

            req.push(result.tracks[0]);
        }
    }
}