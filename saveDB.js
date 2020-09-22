module.exports.saveDB = (servers) => {
    require("fs").writeFile("./servers.js", "module.exports.servers = " + JSON.stringify(servers, null, "\t"), () => {});
}