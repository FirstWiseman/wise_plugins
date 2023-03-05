const { SlashCommandBuilder } = require("@discordjs/builders");
const { QueryType, AudioFilters } = require("discord-player");
const filter = require('../../../api/discord-player-filter')

// filter.

// AudioFilters.define('none', 'dynaudnorm=g=101');
// AudioFilters.define('bassboost', 'bass=g=20:f=110:w=0.3')
// AudioFilters.define('bassboost_hard', 'bass=g=30:f=110:w=0.3')
// AudioFilters.define('nightcore', 'aresample=48000,asetrate=48000*1.25')
// AudioFilters.define('8D', 'apulsator=hz=0.09')
// AudioFilters.define('dim', "afftfilt=\"'real=re * (1-clip((b/nb)*b,0,1))':imag='im * (1-clip((b/nb)*b,0,1))'\"")
// AudioFilters.define('karaoke', 'stereotools=mlev=0.03')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('🎶 Musik | Füge einen Filter zur Wiedergabe hinzu.')
    .addIntegerOption((option) =>option.setName('filter').setDescription('Filter Name').addChoices(
        {name: 'none', value: -1},
        {name: 'bassboost (basic)', value: 0},
        {name: 'bassboost (hard)', value: 1},
        {name: 'nightcore', value: 2},
        {name: '8D', value: 3},
        {name: 'dim', value: 4},
        {name: 'karaoke', value: 5},
    ).setRequired(true)),

    run: async({ client, interaction }) => {

        var filterId = interaction.options.get('filter').value;

        const queue = client.player.getQueue(interaction.guild);

        if(!queue) return await interaction.reply({
            content: ':x: | Momentan spiele ich garkeine Musik.',
            ephemeral: true
        });

        if(filterId == -1){
            await queue.setFilters(
                { 'bassboost':false },
                { 'bassboost_hard':false },
                { 'nightcore':false },
                { '8D':false },
                { 'dim':false },
                { 'karaoke':false })
            await interaction.reply({
                content: `🎶 | Ich habe alle Filter entfernt.`,
                ephemeral: true
            })
        } else if ( filterId == 0) {
            await queue.setFilters({ 'bassboost':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **Bassboost**`,
                ephemeral: true
            })
        }  else if ( filterId == 1) {
            await queue.setFilters({ 'bassboost_hard':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **Bassboost (hard)**`,
                ephemeral: true
            })
        } else if ( filterId == 2) {
            await queue.setFilters({ 'nightcore':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **Nightcore**`,
                ephemeral: true
            })
        } else if (filterId == 3) {
            await queue.setFilters({ '8D':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **8D**`,
                ephemeral: true
            })
        } else if (filterId == 4) {
            await queue.setFilters({ 'dim':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **dim**`,
                ephemeral: true
            })
        } else if (filterId == 5) {
            await queue.setFilters({ 'karaoke':true })
            await interaction.reply({
                content: `🎶 | Neuer Filter hinzugefügt **Karaoke**`,
                ephemeral: true
            })
        } 

    }
}