const { Collection, EmbedBuilder } = require('discord.js');
const { readdirSync } = require('fs');

const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

const premiumServer = require('../../modules/premiumServer');
const Keys = require('../../modules/active-keys');

const { version } = require('./config.json');

const { Player } = require('discord-player');

const path = require('path');

const keyCredentaials = 'MU'

// Funktion Definieren:

const add_music = async(client, guild, interaction, key, time) => {
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

    var dir = path.join(__dirname, 'commands')

    if(!await premiumServer.findOne({ id: guild })) return await interaction.reply({ content: ':x: | Database Error'})

    const FindCommandsSLOL = readdirSync(dir).filter(file => file.endsWith('.js'));

    var body = client.guildcommmands.get(guild) ?? []

    for( const file of FindCommandsSLOL ) {
      const command = require(`${dir}/${file}`);
      client.commands.set(command.data.name, command);
      body.push(command.data.toJSON());
    }
    client.guildcommmands.set(guild, body)

    if(body == undefined){
        console.log("[INSTALL-MUSIC] Could not find Guild REST Commands for "+guild)
        return await interaction.reply({ content: ':x: | Installation Failed. Please send a BugReport'})
    }

    const rest = new REST({ version: '9' }).setToken(client.TOKEN)

    rest.put(Routes.applicationGuildCommands(client.id, guild), {
        body: body
    }).then(async() => {
        client.guildcommmands.set(guild, body)

        client.player = new Player(client, {
            ytdlOptions: {
                highWaterMark: 1 << 25,
                quality: 'highestaudio'
            }
        });

        var pluginObj = {
            backend: {
                guild: {
                    name: client.guilds.cache.get(guild).name,
                    id: guild
                },
                name: 'music',
                version: version,
                date: Keys.findOne({ key: key }).get('time')
            },
            frontend: {
                title: '🎶 Musik',
                description: '🚀 Advanced Discord Musik System - Wisescripts',
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
            content: '🚀 | Ich habe das Musik Plugin Installiert.'
        })
    })
};

module.exports = { add_music };