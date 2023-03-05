const { EmbedBuilder } = require("discord.js");
const { BotError } = require('../../../bot/utils/Error.js')

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if(!client.guildevents.get(message.guildId+"_suggestions")) return
        let sugChannels = JSON.parse(localStorage.getItem("SuggestionsChannels"))
        let serverChannel = sugChannels[message.guildId]
    
        if(message.channelId === serverChannel){
            if(message.author.bot) return
            if(message.content.length === 0) return
            console.log("Suggestion in "+ message.guild.name + " messaage: "+message.content)

            let embed = new EmbedBuilder()
            .setTitle('💡 Vorschlag')
            .setDescription(message.content)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
            
            await message.delete().catch((err) => {
		new BotError(client, "Suggest Message", err.message, message.guild).sendToGuild()
	    })
            let msg = await message.channel.send({embeds: [embed]})
            await msg.react('✅')
            await msg.react('❌')
        }
    }
};
