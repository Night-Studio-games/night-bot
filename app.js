const Discord = require('discord.js');
const config = require('./config.js');
const servers = require("./servers.json");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("Listo");
});

client.on("message", message => {
    if (!message.author.bot) {
        servers.forEach(server => {
            if (message.guild.name == server.name && message.content.startsWith(server.prefix)) {
                const command = message.content.substr(server.prefix.length).split(" ")[0];
                const params = message.content.substr(server.prefix.length).split(" ");
                params.splice(0, 1)
                config.commands.forEach(commandObj => {
                    if (commandObj.name == command) {
                        commandObj.fun(params, message, servers)
                    }
                });
            }
        })
    }
});

client.on("guildMemberAdd", user => {
    servers.forEach(server => {
        if (server.name == user.guild.name) {
            client.channels.fetch(server.welcome)
            .then(channel => {
                channel.send(`Bienvenido a ${server.name} ${user} esperamos disfrutes tu estadia`);
            })
        }
    });
});

client.on("guildMemberRemove", user => {
    servers.forEach(server => {
        if (server.name == user.guild.name) {
            client.channels.fetch(server.farewell)
            .then(channel => {
                channel.send(`Adios ${user}, las puertas de ${server.name} siempre estaran abiertas en caso de que quieras volver`);
            })
        }
    });
});

client.login(config.token);