const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');

giveaways = []

module.exports = {
    data: new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('🎉 Giveaway System | Reroll Giveaways')
    //.addChannelOption(option => option.setName('channel').setDescription('Der Channel vom Giveaway').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Die Message ID vom Giveaway').setRequired(true)),
    run: async ({ client, interaction }) => {
        const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
        
        if (!executer.permissions.has(client.discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({
            content: 'Sie haben nicht die erforderliche Berechtigung, um diesen Befehl auszuführen! (`ADMINISTRATOR`)',
            ephemeral: true
            });
        const channel = interaction.channel
        const giveaway =  await channel.messages.fetch(interaction.options.getString('message')).catch(e => {
            console.log("Reroll Error: "+e.message)
            return interaction.reply({ content: ":x: | Could not find Message", ephemeral: true }) 
        })
    
        if(!message && !msg) return null
        
	if(!giveaway) return interaction.reply({ content: "Konnte Nachricht mit dieser ID nicht finden", ephemeral: true })

	const embeds = giveaway.embeds
        if (embeds.length == 0) return
        const embed = embeds[0]

        const users = await reactedUser(giveaway, channel.id, giveaway.id, '🎉')

        let won = ""
        let reapeat = 0
        for (let i = 0; i < 1; i++){
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

        embed.fields[0].value = won

        let emb = embed.setFields(embed.fields)
        interaction.reply({content: '🎉 Rerolled Giveaway with MessageID: ' + giveaway.id, ephemeral: true})
        giveaway.edit({content: '🎉 GIVEWAY FINISHED 🎉', embeds: [emb]})
        giveaway.channel.send({content: `**🎉 GIVEAWAY 🎉** Gratulation ${won} hat **${embed.title}** gewonnen`})

    },
}

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
