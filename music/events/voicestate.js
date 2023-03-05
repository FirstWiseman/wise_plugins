const { BotError } = require('../../../bot/utils/Error.js')
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
  name: 'voiceStateUpdate',
    async execute(client, oldstate, newstate) {
        if(oldstate){
            if(!client.guildevents.get(oldstate.guild.id+"_music")) return
            if(oldstate.member.user.bot){
                let queue = client.player.getQueue(oldstate.guild)
                if(oldstate.channel === newstate.channel){
                    //queue.setPaused(false)
                    //await queue.play()
                }else if(oldstate.channel && !newstate.channel && oldstate.guild === newstate.guild && oldstate.channel !== newstate.channel){
                    if(queue){
                        if(queue.playing){
                            // let song = queue.current
                            // let streamtime = queue._streamTime;

                            // console.log(streamtime)

                            // await queue.connect(oldstate.channel)
                            // queue.setPaused(false)
                            // await queue.addTrack(song)
                            // await queue.play()
                            // await queue.seek(streamtime)
                        }
                    }
                }
            }
        }
    }
}