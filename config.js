"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var servers_js_1 = require("./servers.js");
var discord_js_1 = require("discord.js");
var saveDB_js_1 = require("./saveDB.js");
var config = {
    token: "token",
    owner: "515614911938822145",
    commands: [
        {
            name: "say",
            syntax: "say <mensaje>",
            info: "envia un mensaje",
            public: true,
            fun: function (array, message) {
                var messageToSend = "";
                array.forEach(function (element) {
                    messageToSend += element + " ";
                });
                var channelId = message.content.match(/<#(((?!>).)*)>/g);
                if (channelId) {
                    channelId = channelId[0];
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
            syntax: "setprefix <prefix>",
            info: "cambia el prefix",
            public: false,
            fun: function (array, message) {
                if (array.length == 0) {
                    message.channel.send("ingresa un prefix");
                }
                else if (array.length > 1) {
                    message.channel.send("El prefix no puede tener espacios");
                }
                else {
                    servers_js_1.servers.filter(function (server) { return server.id == message.guild.id; })[0].prefix = array[0];
                    saveDB_js_1.saveDB(servers_js_1.servers);
                    message.channel.send("prefix cambiado a " + array[0]);
                }
            }
        },
        {
            name: "help",
            syntax: "help",
            info: "Muestra la lista de comandos",
            public: true,
            fun: function (array, message) {
                var embed = new discord_js_1.MessageEmbed()
                    .setTitle("Comandos night-bot")
                    .setAuthor("Night bot", "https://lh3.googleusercontent.com/ogw/ADGmqu_pViz5THQT_uiyetKOp3xgSrheVrrrod53vVA8=s83-c-mo")
                    .setDescription("Estos son todos mis comandos");
                config.commands.forEach(function (command) {
                    if (command.public) {
                        embed.addField(command.syntax, command.info, true);
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
            fun: function (array, message) {
                array[0] = array[0] || "server";
                switch (array[0]) {
                    case "server":
                        var array_1 = servers_js_1.servers.filter(function (server) { return server.id == message.guild.id; })[0].ranking;
                        array_1.sort(function (a, b) { return b.level - a.level; });
                        var embed = new discord_js_1.MessageEmbed().
                            setTitle("ranking de " + message.guild.name);
                        var ids = [];
                        var _loop_1 = function (i) {
                            if (!ids.includes(array_1[i].id)) {
                                ids.push(array_1[i].id);
                                embed.addField(message.guild.members.cache.filter(function (u) { return u.user.id == array_1[i].id; }).first().user.username, "nivel " + array_1[i].level + " || " + Math.trunc(array_1[i].score) + " / " + 5 * Math.pow(2, array_1[i].level));
                            }
                        };
                        for (var i = 0; ids.length < 5; i++) {
                            _loop_1(i);
                        }
                        message.channel.send(embed);
                        break;
                    case "global":
                        var arrayRank_1 = [];
                        servers_js_1.servers.forEach(function (server) {
                            server.ranking.forEach(function (userRank) {
                                arrayRank_1.push({
                                    name: userRank.name,
                                    level: userRank.level,
                                    score: userRank.score,
                                    id: userRank.id,
                                    server: server.id
                                });
                            });
                        });
                        arrayRank_1.sort(function (a, b) { return b.level - a.level; });
                        var embed_2 = new discord_js_1.MessageEmbed().
                            setTitle("ranking global");
                        var ids_2 = [];
                        var _loop_2 = function (i) {
                            if (!ids_2.includes(arrayRank_1[i].id)) {
                                ids_2.push(arrayRank_1[i].id);
                                console.log(arrayRank_1[i].id);
                                embed_2.addField(message.client.guilds.cache.filter(function (g) { return g.id == arrayRank_1[i].server; }).first().members.cache.filter(function (u) { return u.user.id == arrayRank_1[i].id; }).first().user.username + " en " + message.client.guilds.cache.filter(function (g) { return g.id == arrayRank_1[i].server; }).first().name, "nivel " + arrayRank_1[i].level + " || " + Math.trunc(arrayRank_1[i].score) + " / " + 5 * Math.pow(2, arrayRank_1[i].level));
                            }
                        };
                        for (var i = 0; ids_2.length < 5; i++) {
                            _loop_2(i);
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
            fun: function (array, message) {
                var user = message.mentions.members.first();
                if (!user) {
                    user = message.author;
                }
                user = user.user || user;
                var levels = [];
                servers_js_1.servers.forEach(function (server) {
                    server.ranking.forEach(function (userRank) {
                        if (userRank.id == user.id) {
                            levels.push({
                                level: userRank.level,
                                score: userRank.score,
                                server: server.name
                            });
                        }
                    });
                });
                if (levels.length != 0 && levels.filter(function (obj) { return obj.level == 0; }).length == levels.length) {
                    return message.channel.send(new discord_js_1.MessageEmbed()
                        .setDescription("Ese usuario no tiene niveles"));
                }
                levels.sort(function (a, b) { return b.level - a.level; });
                var embed = new discord_js_1.MessageEmbed()
                    .setTitle(user.username)
                    .setImage(user.avatarURL());
                levels.forEach(function (levelObj) {
                    embed.addField(levelObj.server, "Nivel " + levelObj.level + " || " + Math.trunc(levelObj.score) + "/" + 5 * Math.pow(2, levelObj.level));
                });
                message.channel.send(embed);
            }
        },
        {
            name: "eval",
            info: "evalua codigo javascript",
            syntax: "eval <code>",
            public: false,
            fun: function (array, message) {
                var str = "";
                array.forEach(function (element) {
                    str += " " + element;
                });
                var messageToSend;
                try {
                    messageToSend = "```javascript\n" + JSON.stringify(eval(str), null, "\t") + "\n```";
                }
                catch (error) {
                    messageToSend = "```javascript\n" + error + "\n```";
                }
                if (messageToSend.length > 2000) {
                    messageToSend = new discord_js_1.MessageEmbed()
                        .setDescription("El resultado es muy grande");
                }
                message.channel.send(messageToSend);
            }
        },
        {
            name: "off",
            info: "Me apaga",
            syntax: "off",
            public: false,
            fun: function (array, message) {
                message.channel.send("adios")
                    .then(function () {
                    process.exit();
                });
            }
        },
        {
            name: "reload",
            info: "reinicia el bot",
            syntax: "reload",
            fun: function (array, message) {
                var _this = this;
                message.channel.send("🕙 | Reinicio en progreso...").then(function (msg) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                msg.edit("🕙 | Reboot in progress..");
                                message.client.destroy();
                                return [4 /*yield*/, message.client.login(config.token)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, msg.edit("🕙 | Reinicio en progreso...")];
                            case 2:
                                _a.sent();
                                msg.edit("☑️ | Reiniciado Correctamente!");
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
        },
        {
            name: "server",
            info: "muestra informacion del servidor",
            syntax: "server <id?>",
            fun: function (array, message) {
                var guild;
                if (array.length != 0) {
                    if (message.client.guilds.cache.filter(function (g) { return g.id == array[0]; }).size != 0) {
                        console.log(message.client.guilds.cache.filter(function (g) { return g.id == array[0]; }).first().name);
                        guild = message.client.guilds.cache.filter(function (g) { return g.id == array[0]; }).first();
                    }
                    else {
                        message.channel.send(new discord_js_1.MessageEmbed()
                            .setDescription("La id no es valida o yo no estoy en ese servidor"));
                    }
                }
                else {
                    guild = message.guild;
                }
                var embed = new discord_js_1.MessageEmbed()
                    .setTitle(guild.name)
                    .setThumbnail(guild.iconURL())
                    .addField("id", guild.id, true)
                    .addField("Cantidad de miembros", guild.members.cache.size, true)
                    .addField("Cantidad de bots", guild.members.cache.filter(function (u) { return u.user.bot; }).size, true)
                    .addField("prefix", servers_js_1.servers.filter(function (server) { return server.name == guild.name; })[0].prefix, true)
                    .addField("usuarios conectados", guild.members.cache.filter(function (u) { return u.user.presence.status != "offline"; }).size)
                    .addField("creador", guild.owner.user.username + "#" + guild.owner.user.discriminator);
                message.channel.send(embed);
            }
        },
    ]
};
exports["default"] = config;
