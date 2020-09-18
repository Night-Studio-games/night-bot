import fs from "fs";
import { Message } from "discord.js";

const config = {
    token: "NzU2NTExMzU0NDgyODUxODgw.X2S6Gg.0JDfNVeKxsFwh8082NTRbi-P9FQ",
    commands: [
        {
            name: "say",
            syntax: "say [mensaje]",
            info: "envia un mensaje",
            fun (array, message: Message) {
                let messageToSend = "";
                array.forEach(element => {
                    messageToSend += `${element} `;
                });
                let channelId: string[]|string = message.content.match(/<#(((?!>).)*)>/g);
                if (channelId) {
                    console.log(channelId);
                    
                    channelId = channelId[0];
                    console.log(channelId.substr(2, message.content.match(/<#(((?!>).)*)>/g)[0].length - 3));
                    
                    message.client.channels.fetch(channelId.substr(2, message.content.match(/<#(((?!>).)*)>/g)[0].length - 3))
                    .then(channel => {
                        channel.send(messageToSend.replace(`${channelId}`, ""))
                    })
                    .catch(err => {
                        console.log(err);
                    })        
                } else {
                    message.channel.send(messageToSend)
                }
            }
        },
        {
            name: "setprefix",
            syntax: "setprefix [prefix]",
            info: "cambia el prefix",
            fun (array: string[], message: Message, servers: {
                name: string,
                prefix: string,
                welcome: string,
                farewell: string
            }[]) {
                if (message.member.roles.cache.has("733032466947899455")) {
                    if (array.length == 0) {
                        message.channel.send("ingresa un prefix");
                    } else if (array.length > 1) {
                        message.channel.send("El prefix no puede tener espacios")
                    } else {
                        servers.forEach(server => {
                            if (server.name == message.guild.name) {
                                server.prefix = array[0];
                                fs.writeFile("./servers.json", JSON.stringify(servers), () => {});
                                message.channel.send(`prefix cambiado a ${array[0]}`)
                            }
                        })
                    }
                } else {
                    message.channel.send("Lo siento, solo los administradores pueden cambiar el prefix");
                }
            }
        },
        {
            name: "help",
            fun (array, message: Message) {
                let text = "```"
                config.commands.forEach(command =>  {
                    text += `
    **${command.syntax}**:${command.info}`;
                });
                text += "\n```";
                message.channel.send(text)
            }
        }
    ]
}

module.exports = config;