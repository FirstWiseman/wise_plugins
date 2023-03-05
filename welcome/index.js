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
const keyCredentaials = 'WE'

const add_welcome = async(client, guild, interaction, key, time) => {
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

  var dirEvents = path.join(__dirname, 'events')

  if(!await premiumServer.findOne({ id: guild })) return await interaction.reply({ content: ':x: | Database Error'})

//   const AllEvents = readdirSync(dirEvents).filter(file => file.endsWith('.js'));

//   for (const file of AllEvents) {
//     const event = require(`${dirEvents}/${file}`);
//       client.on(event.name, (...args) => event.execute(...args, client));
//   };

//   var body = client.guildcommmands.get(guild) ?? []

  if(!client.config[guild]){
    create_config(client, guild, 'welcome')
  }
  else if(!client.config[guild].welcome){
    create_config(client, guild, 'welcome')
  }

  client.guildevents.set(guild+"_welcome", true)

      var pluginObj = {
          backend: {
              guild: {
                  name: client.guilds.cache.get(guild).name,
                  id: guild
              },
              name: 'welcome',
              version: version,
              date: Keys.findOne({ key: key }).get('time')
          },
          frontend: {
              title: '👋 Welcome',
              description: '🚀 Discord Welcome System - Wisescripts',
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
          content: '🚀 | Ich habe das Welcome Plugin Installiert.'
      })
};

async function create_config(client, guildid, pluginname){
    if(pluginname != "ticket" && pluginname != "welcome") return
    console.log("Create "+pluginname+" Config for "+guildid)
    
    var dirConfig = path.join(__dirname, '..', '..', 'bot')
    var file = fs.readFileSync(`${dirConfig}/config.json`);
    var copyConfig = JSON.parse(file.toString())

    let defaultJsonTicket = `{
            "active": true,
            "logs": "ticket-logs",
            "logsToDm": true,
            "channel": "🎫tickets",
            "channelprefix": "⚫｜",
            "closedchannelprefix": "🔴｜",
            "deleteticketemoji": "<a:wise_loading:946675462774599731>",
            "embed": {
                "color": "#ff0000",
                "description": "Wähle die Kategorie des Tickets aus.",
                "fields": [],
                "rightimage": "https://cdn.discordapp.com/attachments/957293628756226078/958340676783849532/Logo-2000x2000px_-_Animation_-_By_Venom_Designs.gif",
                "bottomimage": "https://cdn.discordapp.com/attachments/919056591431557130/971108153250951318/DCBanner-Wise-ByAnada_1_1.gif",
                "footertext": "WS | Wise_Tickets"
            },
            "categories": [
                {
                    "label": "Kaufen",
                    "emoji": "🎟️",
                    "categorieID": "wise_kaufanfragen",
                    "supportRoles": [
                        "Wise_Managment",
                        "Weiserman"
                    ],
                    "ping": true
                },
                {
                    "label": "Support",
                    "emoji": "🎟️",
                    "categorieID": "937382776662007859",
                    "supportRoles": [
                        "Wise_Managment",
                        "WeiserDeveloper"
                    ],
                    "ping": true
                },
                {
                    "label": "Custom",
                    "emoji": "🎟️",
                    "categorieID": "wise_custom",
                    "supportRoles": [
                        "Wise_Managment",
                        "Weiserman",
                        "WeiserDeveloper"
                    ],
                    "ping": true
                },
                {
                    "label": "Design",
                    "emoji": "🎟️",
                    "categorieID": "wise_design",
                    "supportRoles": [
                        "Weiserman",
                        "Wise_Managment",
                        "WeiserDesigner"
                    ],
                    "ping": true
                }
            ]
        }`
        
        let defaultJsonWelcome = `{
                "active": true,
                "fancy": true,
                "channel": "935881440854413362",
                "textsize": 40,
                "textcolor": "red",
                "title": "Willkommen ~user~",
                "message": "Willkommen ~user~ auf **wise_scripts**",
                "image": "https://cdn.discordapp.com/attachments/919056591431557130/971108153250951318/DCBanner-Wise-ByAnada_1_1.gif",
                "setRoleOnWelcome": [
                    "937422516765474906"
                ]
            }`

            if(!client.config[guildid]){
                let defaultjson = `{ "welcome": {
                    "active": true,
                    "fancy": true,
                    "channel": "935881440854413362",
                    "textsize": 40,
                    "textcolor": "red",
                    "title": "Willkommen ~user~",
                    "message": "Willkommen ~user~ auf **wise_scripts**",
                    "image": "https://cdn.discordapp.com/attachments/919056591431557130/971108153250951318/DCBanner-Wise-ByAnada_1_1.gif",
                    "setRoleOnWelcome": [
                        "937422516765474906"
                    ]
                 } }`
                let json = JSON.parse(defaultjson)
                copyConfig[guildid] = json
            }else{
            
                if(!client.config[guildid].welcome){
                    let json = JSON.parse(defaultJsonWelcome)
                    copyConfig[guildid]["welcome"] = json
                }
    
                if(!client.config[guildid].ticket){
                    let json = JSON.parse(defaultJsonTicket)
                    copyConfig[guildid]["ticket"] = json
                }
            }

        let json_content = JSON.stringify(copyConfig, null, "\t")
        await fs.writeFile(`./config.json`, json_content, 'utf-8', (err) => {
            return new Error(err)
        })
        client.config = copyConfig
}

module.exports = { add_welcome }