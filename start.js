const fs = require('fs');
const { Client, Events, GatewayIntentBits, ActivityType, ChannelType, } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
let config = require('./Config/config.json');

var connectModules = function (dir = './modules', files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            connectModules(name, files_);
        } else {
            files_.push(name);
        }
    }
    var modules = [];
    for (let i = 0; i < files_.length; i++) {
        require(files_[i])
        modules.push(files_[i])
    }
    return modules;
};

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}!`);
    connectModules();
    client.user.setPresence({ activities: [{ 
        name: `Madness Project | version ${require('./package.json').version}`,
        type: ActivityType.Custom
    }], status: 'dnd' });
});

function Rewriting(path, newJson)
{
    fs.writeFileSync(path, JSON.stringify(newJson, null,'\t'));
}

function checkRole(interaction) 
{
    for (let i = 0; i <= interaction.member._roles.length; i++) {
        for (let j = 0; j < config.roleImmunityId.length; j++) {
            if (interaction.member._roles[i] == config.roleImmunityId[j]) {
                return 1;
            }
        }
    }
    return 0;
}

client.login(config.Token);

module.exports = { client, Rewriting, checkRole }