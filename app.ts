import {Client, MessageEmbed, Channel} from 'discord.js';
import {saveDB} from './saveDB.js';
import {writeFile} from 'fs';
import config from './config';
import {servers} from './servers';
const client = new Client();

client.on("ready", () => {
    console.log("");
});

client.on("message", message => {
    if (message.content == "night-set") {
        let ranking = [];
        message.guild.members.cache.forEach(member => {
            ranking.push({
                name: member.user.username,
                level: 0,
                score: 0,
                id: member.id
            });
        });
        servers.push({
            id: message.guild.id,
            ranking: ranking,
            prefix: "night!"
        });
    }
    if (!message.author.bot) {
        const server = servers.filter(server => server.id == message.guild.id)[0];
        if (server.active) {
            if (message.author.id == config.owner && message.content == "night-bot inactive") {
                server.active = false;
            }
            if (message.content.startsWith(server.prefix)) {
                const command = message.content.substr(server.prefix.length).split(" ")[0];
                const params = message.content.substr(server.prefix.length).split(" ");
                params.splice(0, 1)
                const commandList = config.commands.filter(commando => commando.name == command);
                if (commandList.length) {
                    const commandObj = commandList[0];
                    if (commandObj.public == (message.author.id != config.owner) || message.author.id == config.owner) {
                        commandObj.fun(params, message);
                    } else {
                        message.channel.send("Lo siento, solo mi padre puede usar ese comando");
                    }
                } else {
                    message.channel.send(new MessageEmbed()
                        .setDescription(`El comando no es valido, pon ${server.prefix}help para ver la lista de comandos`))
                }
            }

            const user = server.ranking.filter((user) => user.id == message.author.id)[0];
        
            user.score += message.content.length / 5;
            console.log(user.score);
            while (user.score >= 5 * Math.pow(2, user.level)) {
                user.score = user.score - 5 * Math.pow(2, user.level);
                user.level++;
                const embed = new MessageEmbed()
                .setImage(message.author.avatarURL())
                .setDescription(`Felicidades <@${message.author}> has subido al nivel ${user.level}`);
                message.channel.send(embed);
            }
            
        } else if (message.author.id == config.owner && message.content == "night-bot active") {
            server.active = true;
            message.channel.send("Gracias por activarme padre");
        }
        
    }
    saveDB(servers);
});

client.on("guildMemberAdd", user => {
    const server = servers.filter(server => server.id == user.guild.id)[0];
    if (server.welcome) {
        const embed = new MessageEmbed()
        .setImage(user.user.avatarURL())
        .setDescription(`Bienvenido a ${server.name} ${user} esperamos disfrutes tu estadia`);
        client.channels.fetch(server.welcome)
        .then((channel: Channel) => {
            channel.send(embed);
        });
    }
    server.ranking.push({
        name: user.user.username,
        score: 0,
        level: 1,
        id: user.id
    });
    saveDB(servers);
});

client.on("guildMemberRemove", user => {
    const server = servers.filter(server => server.id == user.guild.id)[0];
    if (server.farewell) {
        const embed = new MessageEmbed()
        .setImage(user.user.avatarURL())
        .setDescription(`Adios ${user}, las puertas de ${server.name} siempre estaran abiertas en caso de que quieras volver`);
        client.channels.fetch(server.farewell)
        .then(channel => {
            channel.send(embed);
        });
    }
    server.ranking.splice(server.ranking.indexOf(server.ranking.filter(userRank => userRank.id == user.id)[0]));
    saveDB(servers);
});

client.on("guildCreate", guild => {
    let server = {};
    server.ranking = [];
    guild.members.cache.forEach(member => {
        server.ranking.push({
            name: member.user.username,
            level: 0,
            score: 0,
            id: member.id
        });
    });
    server.prefix = "night!";
    server.id = guild.id;

    servers.push(server);
    saveDB(servers);
});

client.login(config.token);