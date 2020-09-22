"use strict";
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var saveDB_js_1 = require("./saveDB.js");
var config_1 = require("./config");
var servers_1 = require("./servers");
var client = new discord_js_1.Client();
client.on("ready", function () {
    console.log("");
});
client.on("message", function (message) {
    if (message.content == "night-set") {
        var ranking_1 = [];
        message.guild.members.cache.forEach(function (member) {
            ranking_1.push({
                name: member.user.username,
                level: 0,
                score: 0,
                id: member.id
            });
        });
        servers_1.servers.push({
            id: message.guild.id,
            ranking: ranking_1,
            prefix: "night!"
        });
    }
    if (!message.author.bot) {
        var server = servers_1.servers.filter(function (server) { return server.id == message.guild.id; })[0];
        if (server.active) {
            if (message.author.id == config_1["default"].owner && message.content == "night-bot inactive") {
                server.active = false;
            }
            if (message.content.startsWith(server.prefix)) {
                var command_1 = message.content.substr(server.prefix.length).split(" ")[0];
                var params = message.content.substr(server.prefix.length).split(" ");
                params.splice(0, 1);
                var commandList = config_1["default"].commands.filter(function (commando) { return commando.name == command_1; });
                if (commandList.length) {
                    var commandObj = commandList[0];
                    if (commandObj.public == (message.author.id != config_1["default"].owner) || message.author.id == config_1["default"].owner) {
                        commandObj.fun(params, message);
                    }
                    else {
                        message.channel.send("Lo siento, solo mi padre puede usar ese comando");
                    }
                }
                else {
                    message.channel.send(new discord_js_1.MessageEmbed()
                        .setDescription("El comando no es valido, pon " + server.prefix + "help para ver la lista de comandos"));
                }
            }
            var user = server.ranking.filter(function (user) { return user.id == message.author.id; })[0];
            user.score += message.content.length / 5;
            console.log(user.score);
            while (user.score >= 5 * Math.pow(2, user.level)) {
                user.score = user.score - 5 * Math.pow(2, user.level);
                user.level++;
                var embed = new discord_js_1.MessageEmbed()
                    .setImage(message.author.avatarURL())
                    .setDescription("Felicidades <@" + message.author + "> has subido al nivel " + user.level);
                message.channel.send(embed);
            }
        }
        else if (message.author.id == config_1["default"].owner && message.content == "night-bot active") {
            server.active = true;
            message.channel.send("Gracias por activarme padre");
        }
    }
    saveDB_js_1.saveDB(servers_1.servers);
});
client.on("guildMemberAdd", function (user) {
    var server = servers_1.servers.filter(function (server) { return server.id == user.guild.id; })[0];
    if (server.welcome) {
        var embed_1 = new discord_js_1.MessageEmbed()
            .setImage(user.user.avatarURL())
            .setDescription("Bienvenido a " + server.name + " " + user + " esperamos disfrutes tu estadia");
        client.channels.fetch(server.welcome)
            .then(function (channel) {
            channel.send(embed_1);
        });
    }
    server.ranking.push({
        name: user.user.username,
        score: 0,
        level: 1,
        id: user.id
    });
    saveDB_js_1.saveDB(servers_1.servers);
});
client.on("guildMemberRemove", function (user) {
    var server = servers_1.servers.filter(function (server) { return server.id == user.guild.id; })[0];
    if (server.farewell) {
        var embed_2 = new discord_js_1.MessageEmbed()
            .setImage(user.user.avatarURL())
            .setDescription("Adios " + user + ", las puertas de " + server.name + " siempre estaran abiertas en caso de que quieras volver");
        client.channels.fetch(server.farewell)
            .then(function (channel) {
            channel.send(embed_2);
        });
    }
    server.ranking.splice(server.ranking.indexOf(server.ranking.filter(function (userRank) { return userRank.id == user.id; })[0]));
    saveDB_js_1.saveDB(servers_1.servers);
});
client.on("guildCreate", function (guild) {
    var server = {};
    server.ranking = [];
    guild.members.cache.forEach(function (member) {
        server.ranking.push({
            name: member.user.username,
            level: 0,
            score: 0,
            id: member.id
        });
    });
    server.prefix = "night!";
    server.id = guild.id;
    servers_1.servers.push(server);
    saveDB_js_1.saveDB(servers_1.servers);
});
client.login(config_1["default"].token);
