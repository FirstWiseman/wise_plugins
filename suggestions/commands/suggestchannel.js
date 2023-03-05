const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestions-channel')
    .setDescription('💡 Suggest System | Channel für Vorschläge angeben')
    .addChannelOption(option =>
      option.setName('channel')
      .setDescription('Der Vorschläge Channel')
      .setRequired(true)),
  run: async({ client, interaction }) => {
      const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
          
      if (!executer.permissions.has(client.discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({
          content: 'Sie haben nicht die erforderliche Berechtigung, um diesen Befehl auszuführen! (`ADMINISTRATOR`)',
          ephemeral: true
      });

      let channel = interaction.options.getChannel('channel')
      if(!localStorage.getItem("SuggestionsChannels")){
        let serverSuggestionChannels = new Object()
        serverSuggestionChannels[interaction.guildId] = new Array()
        localStorage.setItem("SuggestionsChannels", JSON.stringify(serverSuggestionChannels))
      }
      let sugChannels = JSON.parse(localStorage.getItem("SuggestionsChannels"))
      sugChannels[interaction.guildId] = channel.id

      localStorage.setItem('SuggestionsChannels', JSON.stringify(sugChannels))
      interaction.reply({content: "✅", ephemeral: true})
  },
};
