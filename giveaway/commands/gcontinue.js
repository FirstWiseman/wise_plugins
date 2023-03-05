const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

var giveaways = []

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gcontinue')
    .setDescription('🎉 Giveaway System | Giveaway fortsetzen')
    .addChannelOption(option => option.setName('channel').setDescription('Der Channel für das Giveaway').setRequired(true))
    .addStringOption(option => option.setName('messageid').setDescription('Die Message ID vom Giveaway').setRequired(true)),
    run: async ({ client, interaction }) => {
        const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
        
        if (!executer.permissions.has(client.discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({
            content: 'Sie haben nicht die erforderliche Berechtigung, um diesen Befehl auszuführen! (`ADMINISTRATOR`)',
            ephemeral: true
            });

        const channel = interaction.options.getChannel('channel')

        await channel.messages.fetch(interaction.options.getString('messageid'))
        .then(message => {
            if(message.embeds?.size < 1 || !message.embeds) return interaction.reply({ content: ":x: | This Message is not a Giveaway ", ephemeral: true }) 

            const embed = message.embeds[0]

            if(!embed.fields.some(f => f.name === "Winners")) return interaction.reply({ content: ":x: | This Message is not a Giveaway ", ephemeral: true }) 

            let title = embed.title
            let winners = embed.fields[0].value
            let time = embed.fields[1].value.toString().trim()
            let user = embed.fields[2].value
                
            // if(time.substring(1,2) == 0){
            //     time += "s"
            // }

            // if (message.id == "1026516997476995083"){
            //     time = "9h"
            // }

            // if(message.id == "991741323893813382"){
            //     time = "9h"
            // }

            // if(message.id == "991741458283516046"){
            //     time = "9h"
		    // }
    
            var time_int = 0
            if(time.replace(/[0-9]/gi, "") == "d"){
                time_int = parseInt(time.replace(/[A-Z]/gi, ""))*24*3600*1000
            }else if(time.replace(/[0-9]/gi, "") == "h") {
                time_int = parseInt(time.replace(/[A-Z]/gi, ""))*3600*1000
            }else if(time.replace(/[0-9]/gi, "") == "m"){
                time_int = parseInt(time.replace(/[A-Z]/gi, ""))*60*1000
            }else if(time.replace(/[0-9]/gi, "") == "s"){
                time_int = parseInt(time.replace(/[A-Z]/gi, ""))*1000
            }else{
                console.log("[GIVEAWAY-PLUGIN] No valid time given")
                time_int = 2
            }

            let giveawayID = setInterval(updateEmbed, 4000, title, winners, message, interaction.user)
            giveaways[message.id] = { time: time_int, giveawayid: giveawayID }

            interaction.reply({content: `Continue Giveaway \``+interaction.options.getString('messageid')+'`', ephemeral: true})
        })
        .catch((err) => {
            return interaction.reply({ content: ":x: | Could not find Message", ephemeral: true }) 
        });

    },
};

async function updateEmbed(title, winners, message, hosting) {
    var time = giveaways[message.id].time
    var giveawayID = giveaways[message.id].giveawayid
    let channel = await message.guild.channels.cache.get(message.channelId)
    var msg =  await channel.messages?.fetch(message?.id).catch(e => {
        console.log("gcontinue.js Error: "+e.message)
        return interaction.reply({ content: ":x: | Could not find Message", ephemeral: true }) 
    })

    if(!message && !msg) return null

    time = time - giveawayID._idleTimeout
    giveaways[message.id].time = time

    var embedtime = null
    if(time > 3600*24*1000) {
        embedtime = Math.floor(((time/1000)/(3600*24))).toString() + "d"
        if(giveawayID._idleTimeout != 3600*24){
            clearInterval(giveawayID)
            giveaways[message.id].giveawayid= setInterval(updateEmbed, 3600*24*1000, title, winners, message, hosting)
        }
    }else if(time > 3600*1000) {
        embedtime = Math.floor(((time/1000)/3600)).toString() + "h"
        if(giveawayID._idleTimeout != 3600*1000){
            clearInterval(giveawayID)
            giveaways[message.id].giveawayid= setInterval(updateEmbed, 3600*1000, title, winners, message, hosting)
        }
    }else if (time > 60*1000){
        embedtime = Math.floor(((time/1000)/60)).toString() + "m"
        if(giveawayID._idleTimeout != 60*1000){
            clearInterval(giveawayID)
            giveaways[message.id].giveawayid= setInterval(updateEmbed, 60*1000, title, winners, message, hosting)
        }
    }else {
        embedtime = Math.floor((time/1000)).toString() + "s"
        if(giveawayID._idleTimeout != 4000){
            clearInterval(giveawayID)
            giveaways[message.id].giveawayid= setInterval(updateEmbed, 4000, title, winners, message, hosting)
        }
    }

    var embed = null
    if (time > 0){
        embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription('React with 🎉 to enter')
        .addFields(
            { name: 'Winners', value: winners.toString(), inline: true },
            { name: 'Remaining', value: embedtime, inline: true },
            { name: 'Hosted by', value: `<@!${hosting.id}>`, inline: true }
        )
        .setTimestamp()
    }else {
        const users = await reactedUser(msg, message.channelId, msg.id, '🎉')
        var won = ""
        var reapeat = 0

        for (let i = 0; i < winners; i++){
            var user = users.random()

            while (user.bot){
                user = users.random()
            }

            if(!won.includes(user.toString())){
                if (i > 1 && i < winners){
                    won += user.toString() + " "
                }else{
                    won += user.toString()
                }
            }else{
                i--;
                reapeat++;

                if(reapeat > 10){
                    break;
                }
            }
        }

        embed = new EmbedBuilder()
        .setTitle(title)
        .addFields(
            { name: '**Winner**', value: won, inline: true },
            { name: 'Hosted by', value: `<@!${hosting.id}>`, inline: true }
        )
        .setTimestamp()

        clearInterval(giveawayID)
        msg.edit({content: "🎉 GIVEWAY FINISHED 🎉", embeds: [embed]})
        message.channel.send({content: `**🎉 GIVEAWAY 🎉** Gratulation ${won} hat **${title}** gewonnen`})
    }
    
    msg.edit({embeds: [embed]})
}
 
function isTimeFormat(string) {
    return (isNumeric(string.substring(0,1)) && (string.substring(1,2) == "d" || string.substring(1,2) == "m" || string.substring(1, 2) == "h" || string.substring(1, 2) == 0))
}


function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.randomAmount = function (length) {
	let arr = [];
	for (let i = 0; i < length; i++) {
		arr.push(this.random());
	}

	return arr;
};

async function reactedUser (msg, channelID, messageID, emoji) {
    let cacheChannel = await msg.guild.channels.cache.get(channelID);
    var userList = new Promise((resolve) => {
        if(cacheChannel){
            cacheChannel.messages.fetch(messageID).then(async reactionMessage => {
                reactionMessage.reactions.resolve(emoji).users.fetch().then(async userList => {
                    userList = await userList.map(user => user)
                    resolve(userList)
                });
            });
        }
    })
    return userList
}
