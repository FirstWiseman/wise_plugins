const { Collection, EmbedBuilder } = require('discord.js');
const { readdirSync } = require('fs');

const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

const premiumServer = require('../../modules/premiumServer');
const Keys = require('../../modules/active-keys');
const fs = require('fs');

// const { token, clientId, version } = require('./config.json');
const path = require('path');


const version = "1.0.0"
const keyCredentaials = 'TI'


const add_suggestions = async(client, guild, interaction, key, time) => {
  if(!client) {
      throw new Error('Es wurde kein Client Definiert');
  }

  if(!guild) {
      throw new Error('Es wurde kein Server angegeben.');
  }

  if(key !== "93230612"){
    if(!key.startsWith(keyCredentaials)) return await interaction.reply({ content: ':x: | Invalid Key '});

    if(!await Keys.findOne({ key: key })) return await interaction.reply({ content: ':x: | Invalid Key '});
  }

  var dirCommands = path.join(__dirname, 'commands')

  if(!await premiumServer.findOne({ id: guild })) return await interaction.reply({ content: ':x: | Database Error'})

  const FindCommandsSLOL = readdirSync(dirCommands).filter(file => file.endsWith('.js'));
//   const AllEvents = readdirSync(dirEvents).filter(file => file.endsWith('.js'));

//   for (const file of AllEvents) {
//     const event = require(`${dirEvents}/${file}`);
//       client.on(event.name, (...args) => event.execute(...args, client));
//   };

  var body = client.guildcommmands.get(guild) ?? []

  if(!localStorage.getItem("SuggestionsChannels")){
    let serverSuggestionChannels = new Object()
    serverSuggestionChannels[guild] = new Array()
    localStorage.setItem("SuggestionsChannels", JSON.stringify(serverSuggestionChannels))
  }

  for( const file of FindCommandsSLOL ) {
    const command = require(`${dirCommands}/${file}`);
    client.commands.set(command.data.name, command);
    body.push(command.data.toJSON());
  }
  client.guildcommmands.set(guild, body)

  client.guildevents.set(guild+"_ticket", true)

  if(body == undefined){
    console.log("[INSTALL-TICKET] Could not find Guild REST Commands for "+guild)
    return await interaction.reply({ content: ':x: | Installation Failed. Please send a BugReport'})
  }
  

  const rest = new REST({ version: '9' }).setToken(client.TOKEN)

  rest.put(Routes.applicationGuildCommands(client.id, guild), {
      body: body
  }).then(async() => {
      var pluginObj = {
          backend: {
              guild: {
                  name: client.guilds.cache.get(guild).name,
                  id: guild
              },
              name: 'suggestions',
              version: version,
              date: Keys.findOne({ key: key }).get('time')
          },
          frontend: {
              title: '💡 Suggestions',
              description: '🚀 Discord Suggestions System - Wisescripts',
              version: version,
              guild: {
                  name: client.guilds.cache.get(guild).name,
                  id: guild
              }
          }
      }

      await premiumServer.findOneAndUpdate({
          id: guild
      }, {
          $push: {
              plugins: pluginObj
          }
      });

      await Keys.findOneAndDelete({ key: key });

      await interaction.reply({
          content: '🚀 | Ich habe das Suggestion Plugin Installiert.'
      })
  })
};

module.exports = { add_suggestions }