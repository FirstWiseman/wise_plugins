const gifFrames = require('gif-frames');
const GIFEncoder = require('gif-encoder-2');
const Canvas = require('canvas')
const fs = require('fs')
const { AttachmentBuilder, Interaction } = require('discord.js')
const { BotError } = require('../../../bot/utils/Error.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        if(!client.guildevents.get(member.guild.id+"_welcome")) return

        if(!client.config[member.guild.id].welcome.active) return
        let guild = client.guilds.cache.get(member.guild.id)

        if(client.config[member.guild.id].welcome.fancy){
            var channel
            if (isNumeric(client.config[member.guild.id].welcome.channel)) {
                channel = guild.channels.cache.get(client.config[member.guild.id].welcome.channel)
            }else {
                channel = guild.channels.cache.find(channel => channel.name === client.config[member.guild.id].welcome.channel);
            }

            if(channel == null){
                return new BotError(client, "Sending Welcome Message", "Channel not found", guild).sendToGuild()
            }


            if(member.guild.id === "935879131630018562" && client.config[member.guild.id].welcome.image.endsWith('.gif')){
                console.log(guild.name+" | Loading Frames...")
                let width = 640
                let height = 357
    
                await Canvas.loadImage(client.config[member.guild.id].welcome.image).then(image =>{              
                  width = image.width
                  height = image.height
                })

                let frames = await extractFrames(client.config[member.guild.id].welcome.image) 
                if(!width && !height) return console.log("No Height and Width found")
                let encoder = new GIFEncoder(width, height, 'neuquant', false, frames.length)
                encoder.setRepeat(0);

                const canvas = Canvas.createCanvas(width, height);
                const ctx = canvas.getContext('2d');
                encoder.start()

                // encoder.on('progress', percent => {
                //     console.log(guild.name+" | Load Welcome GIF", percent+" %\r");
                // })

                let text = client.config[member.guild.id].welcome.title.replace(/~user~/gi, `${member.user.tag}`)
                let avatarimg = await Canvas.loadImage(member.displayAvatarURL({ forceStatic: true, extension: "png", size:1024 }))

                for(let index = 0; index < frames.length; index++){
                    ctx.drawImage(frames[index].imagedata, 0, 0);
                    
                    // ctx.textAlign = "center";
                    // ctx.fillStyle = client.config[member.guild.id].welcome.textcolor
                    // var txtsize = client.config[member.guild.id].welcome.textsize            
                    // ctx.font= Math.floor(txtsize).toString()+"px Comic Sans MS";
                    // ctx.fillText(text, canvas.width/2, canvas.height/2 + 120)
                    
                    // ctx.textAlign = "center";
                    // ctx.font = "25px sans-serif"
                    // text = `Member #${member.guild.memberCount}`
                    // ctx.fillStyle = client.config[member.guild.id].welcome.textcolor
                    // ctx.fillText(text, canvas.width/2, canvas.height/2 + 180)
                    // ctx.beginPath()
                    // ctx.arc(512, 186, r, 0, Math.PI * 2, true)
                    // ctx.closePath()
                    // ctx.clip()
                    ctx.drawImage(avatarimg, 0, 0)


                    encoder.setDelay(frames[index].delay);
                    encoder.setDispose(frames[index].disposal);
                    encoder.addFrame(ctx);
                }

                encoder.finish();

                const content = client.config[member.guild.id].welcome.message.replace(/~user~/gi, `<@!${member.user.id}>`)
                const attachment = new AttachmentBuilder(encoder.out.getData(), { name:`welcome-${member.id}.gif` })
                channel.send({content: content, files: [attachment]}).catch(err => {
                    new BotError(client, "Sending Welcome Message", err, guild).sendToGuild()
                })
                return
            }

            const canvas = Canvas.createCanvas(1024, 500)
            const ctx = canvas.getContext('2d')

            let text = client.config[member.guild.id].welcome.title.replace(/~user~/gi, `${member.user.tag}`)
            var r = 110

            if (!client.config[member.guild.id].welcome.image.startsWith('http') || !client.config[member.guild.id].welcome.image.startsWith('https')) return
            await Canvas.loadImage(client.config[member.guild.id].welcome.image).then(image =>{
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                ctx.textAlign = "center";
                ctx.fillStyle = client.config[member.guild.id].welcome.textcolor
                var txtsize = client.config[member.guild.id].welcome.textsize            
                ctx.font= Math.floor(txtsize).toString()+"px Comic Sans MS";
                ctx.fillText(text, canvas.width/2, canvas.height/2 + 120)
                ctx.beginPath()
                ctx.arc(512, 186, r+6, 0, Math.PI * 2, true)
                ctx.stroke()
                ctx.fill() 
            }).catch(err => {
                new BotError(client, "Loading Image", err, guild).sendToGuild()
            })


            ctx.fillStyle = client.config[member.guild.id].welcome.textcolor
            ctx.textAlign = "center";
            ctx.font = "30px sans-serif"
            text = `Member #${member.guild.memberCount}`
            ctx.fillStyle = client.config[member.guild.id].welcome.textcolor
            ctx.fillText(text, canvas.width/2, canvas.height/2 + 180)
            ctx.beginPath()
            ctx.arc(512, 186, r, 0, Math.PI * 2, true)
            ctx.closePath()
            ctx.clip()
            await Canvas.loadImage(member.displayAvatarURL({ forceStatic: true, extension: "png", size:1024 })).then(image => {
                ctx.drawImage(image, canvas.width/2-r, (canvas.height/2-r*2)+45, r*2, r*2)
            })
            
            const content = client.config[member.guild.id].welcome.message.replace(/~user~/gi, `<@!${member.user.id}>`)

            const attachment = new AttachmentBuilder(canvas.toBuffer(), `welcome-${member.id}.png`)
            await channel.send({content: content, files: [attachment]}).catch(err => {
                console.log(err.message)
                new BotError(client, "Sending Welcome Message", err, guild).sendToGuild()
            })

            // member.roles.add(client.config[member.guild.id].welcome.setRoleOnWelcome).catch(err => {
            //     new BotError(client, "Adding Role to User", err, guild).sendToGuild()
            //   })

            client.config[member.guild.id].welcome.setRoleOnWelcome.forEach((rol) => {
                let role = member.guild?.roles?.cache.find(r => r.name === rol|| r.id === rol)
                if(role) member.roles.add(role)
            })

            
        }else{
            const welcomeMessage = client.config[member.guild.id].welcome.message
            const welcomeTitle = client.config[member.guild.id].welcome.title
            const img = client.config[member.guild.id].welcome.image
            
            var channel
            let guild = client.guilds.cache.get(member.guild.id)
            if (isNumeric(client.config[member.guild.id].welcome.channel)) {
                channel = guild.channels.cache.get(client.config[member.guild.id].welcome.channel)
            }else {
                channel = guild.channels.cache.find(channel => channel.name === client.config[member.guild.id].welcome.channel);
            }
            
            if(channel == null){
                return new BotError(client, "Sending Welcome Message", "Channel not found", guild).sendToGuild()
            }

            const embed = new client.discord.EmbedBuilder()
              .setColor(client.config[member.guild.id].welcome.textcolor.toUpperCase())
              .setTitle(welcomeTitle.replace(/~user~/gi, member.displayName))
              .setThumbnail(img)
              .addFields({name: "\u200B", value: welcomeMessage.replace(/~user~/gi, `<@${member.id}>`), inline: false})
              .setTimestamp();

              if(client.config[member.guild.id].welcome?.bottomimage) embed.setImage(client.config[member.guild.id].welcome.bottomimage)

              await channel.send({
                embeds: [embed]
              }).catch(err => {
                  new BotError(client, "Sending Welcome Message", err, guild).sendToGuild()
              })

              // if (client.config[member.guild.id].welcome.setRoleOnWelcome != null) {
              //   member.roles.add(client.config[member.guild.id].welcome.setRoleOnWelcome).then().catch(err => {
              //     new BotError(client, "Adding Role to User", err, guild).sendToGuild()
              //   })
              // }
            client.config[member.guild.id].welcome.setRoleOnWelcome.forEach((rol) => {
                let role = member.guild?.roles?.cache.find(r => r.name === rol || r.id === rol)
                if(role) member.roles.add(role)
            })
        }
    }
};

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}


async function extractFrames(url){
    let allFrames = []
    return new Promise(async (res) => {
      let data = await gifFrames({url: url, frames: 'all', outputType: 'jpg', cumulative: true})
      gifwidth = data[0].frameInfo.width
      gifheight = data[0].frameInfo.height
    
      for(let index = 0; index < data.length; index++){
        await new Promise(res => {
          const image = new Canvas.Image()
    
          image.onload = () => {
            allFrames.push({
              imagedata: image,
              delay: data[index].frameInfo.delay * 5,
              disposal: data[index].frameInfo.disposal
            })
            res()
          }
    
          image.src = data[index].getImage()._obj
        })
      }
  
      res(allFrames)
    })
  }