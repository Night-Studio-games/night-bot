"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var config = {
    token: "NzU2NTExMzU0NDgyODUxODgw.X2S6Gg.0JDfNVeKxsFwh8082NTRbi-P9FQ",
    commands: [
        {
            name: "say",
            syntax: "say [mensaje]",
            info: "envia un mensaje",
            fun: function (array, message) {
                var messageToSend = "";
                array.forEach(function (element) {
                    messageToSend += element + " ";
                });
                var channelId = message.content.match(/<#(((?!>).)*)>/g);
                if (channelId) {
                    console.log(channelId);
                    channelId = channelId[0];
                    console.log(channelId.substr(2, message.content.match(/<#(((?!>).)*)>/g)[0].length - 3));
                    message.client.channels.fetch(channelId.substr(2, message.content.match(/<#(((?!>).)*)>/g)[0].length - 3))
                        .then(function (channel) {
                        channel.send(messageToSend.replace("" + channelId, ""));
                    })["catch"](function (err) {
                        console.log(err);
                    });
                }
                else {
                    message.channel.send(messageToSend);
                }
            }
        },
        {
            name: "setprefix",
            syntax: "setprefix [prefix]",
            info: "cambia el prefix",
            fun: function (array, message, servers) {
                if (message.member.roles.cache.has("733032466947899455")) {
                    if (array.length == 0) {
                        message.channel.send("ingresa un prefix");
                    }
                    else if (array.length > 1) {
                        message.channel.send("El prefix no puede tener espacios");
                    }
                    else {
                        servers.forEach(function (server) {
                            if (server.name == message.guild.name) {
                                server.prefix = array[0];
                                fs_1.writeFile("./servers.json", JSON.stringify(servers), function () { });
                                message.channel.send("prefix cambiado a " + array[0]);
                            }
                        });
                    }
                }
                else {
                    message.channel.send("Lo siento, solo los administradores pueden cambiar el prefix");
                }
            }
        },
        {
            name: "help",
            fun: function (array, message) {
                var text = "";
                config.commands.forEach(function (command) {
                    text += "```fix\n\t" + command.syntax + " = " + command.info + "\n```";
                });
                message.channel.send(text);
            },
            syntax: "help",
            info: "muestra la lista de comandos"
        }
    ]
};
module.exports = config;
