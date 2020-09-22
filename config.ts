import { servers } from './servers.js';
import { Guild, GuildMember, Message, MessageEmbed, User} from "discord.js";
import { saveDB } from './saveDB.js';

const config = {
    token: "token",
    owner: "515614911938822145",
    commands: [
        {
            name: "say",
            syntax: "say <mensaje>",
            info: "envia un mensaje",
            public: true,
            fun (array, message: Message) {
                let messageToSend = "";
                array.forEach(element => {
                    messageToSend += `${element} `;
                });
                let channelId: string[]|string = message.content.match(/<#(((?!>).)*)>/g);
                if (channelId) {
                    channelId = channelId[0];
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
            syntax: "setprefix <prefix>",
            info: "cambia el prefix",
            public: false,
            fun (array: string[], message: Message) {
                if (array.length == 0) {
                    message.channel.send("ingresa un prefix");
                } else if (array.length > 1) {
                    message.channel.send("El prefix no puede tener espacios")
                } else {
                    servers.filter(server => server.id == message.guild.id)[0].prefix = array[0];
                    saveDB(servers);
                    message.channel.send(`prefix cambiado a ${array[0]}`);
                }
            }
        },
        {
            name: "help",
            syntax: "help", 
            info: "Muestra la lista de comandos",
            public: true,
            fun (array, message: Message) {
                const embed = new MessageEmbed()
                .setTitle("Comandos night-bot")
                .setAuthor("Night bot", "https://lh3.googleusercontent.com/ogw/ADGmqu_pViz5THQT_uiyetKOp3xgSrheVrrrod53vVA8=s83-c-mo")
                .setDescription("Estos son todos mis comandos")
                config.commands.forEach(command => {
                    if (command.public) {
                        embed.addField(command.syntax, command.info, true)
                    }
                });
                message.channel.send(embed);
            }
        },
        {
            name: "rank",
            syntax: "rank",
            info: "da la lista de los 5 usuarios con mas nivel",
            public: true,
            fun (array, message: Message) {
                array[0] = array[0] || "server";
                switch (array[0]) {
                    case "server":
                        const array = servers.filter((server) => server.id == message.guild.id)[0].ranking;
                        array.sort((a, b) => b.level - a.level);
                        const embed = new MessageEmbed().
                        setTitle(`ranking de ${message.guild.name}`);
                        const ids: string[] = [];
                        for (let i = 0; ids.length < 5; i++) {
                            if (!ids.includes(array[i].id)) {
                                ids.push(array[i].id);

                                embed.addField(message.guild.members.cache.filter(u => u.user.id == array[i].id).first().user.username, `nivel ${array[i].level} || ${Math.trunc(array[i].score)} / ${5 * Math.pow(2, array[i].level)}`)
                            }
                        }
                        message.channel.send(embed);
                        break;
                
                    case "global":
                        let arrayRank: {
                            name: string,
                            level: number,
                            score: number,
                            id: string,
                            server: string
                        }[] = []; 
                        servers.forEach(server => {
                            server.ranking.forEach(userRank => {
                                arrayRank.push({
                                    name: userRank.name,
                                    level: userRank.level,
                                    score: userRank.score,
                                    id: userRank.id,
                                    server: server.id
                                });
                            });
                        });
                        
                        arrayRank.sort((a, b) => b.level - a.level);
                        const embed_2 = new MessageEmbed().
                        setTitle(`ranking global`);
                        const ids_2: string[] = [];
                        for (let i = 0; ids_2.length < 5; i++) {
                            if (!ids_2.includes(arrayRank[i].id)) {
                                ids_2.push(arrayRank[i].id);
                                embed_2.addField(`${message.client.guilds.cache.filter(g => g.id == arrayRank[i].server).first().members.cache.filter(u => u.user.id == arrayRank[i].id).first().user.username} en ${message.client.guilds.cache.filter(g => g.id == arrayRank[i].server).first().name}`, `nivel ${arrayRank[i].level} || ${Math.trunc(arrayRank[i].score)} / ${5 * Math.pow(2, arrayRank[i].level)}`)
                            }
                        }
                        message.channel.send(embed_2);
                        break;

                    default:
                        break;
                }
            }
        },
        {
            name: "userrank", 
            info: "Da informacion del usuario", 
            syntax: "userrank <user?>", 
            public: true,
            fun (array, message: Message) {
                let user: User|GuildMember = message.mentions.members.first();
                if (!user) {
                    user = message.author;
                }
                user = user.user || user;
                const levels: {
                    level: number, 
                    score: number, 
                    server: string
                }[] = [];
                servers.forEach(server => {
                    server.ranking.forEach(userRank => {
                        if (userRank.id == user.id) {
                            levels.push({
                                level: userRank.level,
                                score: userRank.score,
                                server: server.name
                            });
                        }
                    });
                });
                if (levels.length != 0 && levels.filter(obj => obj.level == 0).length == levels.length) {
                    return message.channel.send(new MessageEmbed()
                    .setDescription("Ese usuario no tiene niveles"));
                }
                levels.sort((a , b) => b.level - a.level)
                const embed = new MessageEmbed()
                .setTitle(user.username)
                .setImage(user.avatarURL());
                levels.forEach(levelObj => {
                    embed.addField(levelObj.server, `Nivel ${levelObj.level} || ${Math.trunc(levelObj.score)}/${5 * Math.pow(2, levelObj.level)}`)
                });
                message.channel.send(embed);
            }
        },
        {
            name: "eval",
            info: "evalua codigo javascript", 
            syntax: "eval <code>",
            public: false,
            fun (array, message: Message) {
                let str = "";
                array.forEach(element => {
                    str += " " + element;
                });
                let messageToSend: string|MessageEmbed;
                try {
                    messageToSend = `\`\`\`javascript
${JSON.stringify(eval(str), null, "\t")}
\`\`\``
                } catch (error) {
                    messageToSend = `\`\`\`javascript
${error}
\`\`\``;
                }
                if (messageToSend.length > 2000) {
                    messageToSend = new MessageEmbed()
                    .setDescription("El resultado es muy grande");
                }
                message.channel.send(messageToSend)
            }
        },
        {
            name: "off",
            info: "Me apaga",
            syntax: "off", 
            public: false,
            fun (array, message: Message) {
                message.channel.send("adios")
                .then(() => {
                    process.exit();
                });
            }
        },
        {
            name: "reload", 
            info: "reinicia el bot",
            syntax: "reload",
            fun (array, message: Message) {
                message.channel.send("🕙 | Reinicio en progreso...").then(async msg => {
                    msg.edit("🕙 | Reboot in progress..")
                    message.client.destroy();
                    await message.client.login(config.token);
                    await msg.edit("🕙 | Reinicio en progreso...")
                    msg.edit("☑️ | Reiniciado Correctamente!")
                })
            }
        },
        {
            name: "server", 
            info: "muestra informacion del servidor", 
            syntax: "server <id?>", 
            fun (array, message: Message) {
                let guild: Guild;
                if (array.length != 0) {
                    if (message.client.guilds.cache.filter(g => g.id == array[0]).size != 0) {
                        console.log(message.client.guilds.cache.filter(g => g.id == array[0]).first().name);
                        guild = message.client.guilds.cache.filter(g => g.id == array[0]).first();
                    } else {
                        message.channel.send(new MessageEmbed()
                        .setDescription("La id no es valida o yo no estoy en ese servidor"))
                    }
                } else {
                   guild = message.guild;
                }
                const embed = new MessageEmbed()
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL())
                .addField("id", guild.id, true)
                .addField("Cantidad de miembros", guild.members.cache.size, true)
                .addField("Cantidad de bots", guild.members.cache.filter(u => u.user.bot).size, true)
                .addField("prefix", servers.filter(server => server.name == guild.name)[0].prefix, true)
                .addField("usuarios conectados", guild.members.cache.filter(u => u.user.presence.status != "offline").size)
                .addField("creador", `${guild.owner.user.username}#${guild.owner.user.discriminator}`);
                message.channel.send(embed);
            }
        },
    ],
}

export default config