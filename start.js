const fs = require('fs');
const { Client, Events, GatewayIntentBits, ActivityType, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
let config = require('./Config/config.json');
let configLobby = require('./modules/createRooms/config.json');
const filter = async (i) => 
    i.customId === 'editname' ||
    i.customId === 'permissionschannel' ||
    i.customId === 'editslot';

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

    const guild = client.guilds.cache.get(config.Guild_id);

    function ButtonsSettingsRoom()
    {
        const editName = new ButtonBuilder()
            .setCustomId("editname")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝")

        const permissionsChannel = new ButtonBuilder()
            .setCustomId("permissionschannel")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔒")

        const editSlot = new ButtonBuilder()
            .setCustomId("editslot")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("👥")

        return [editName, editSlot, permissionsChannel];
    }

    const settingsMessage = new EmbedBuilder()
        .setColor("#2E8BC0")
        .setTitle("⚙️ Управление каналом")
        .setDescription(`
            Измените конфигурацию вашей комнаты с помощью панели управления.

            📝 — Изменить название комнаты

            👥 — Задать новый лимит участников

            🔒 — Ограничить/Выдать доступ к комнате
        
        `)
        .setTimestamp()

        let buttons = ButtonsSettingsRoom();

    guild.channels.cache.get(lobby.id_settingsRooms).send({embeds: [settingsMessage], components: [new ActionRowBuilder().addComponents(...buttons)]});


    const collector = guild.channels.cache.get(configLobby.id_settingsRooms).createMessageComponentCollector({filter});
            
    collector.on('collect', async i => {
        if (i.customId === 'editname') {
            
        }

        if (i.customId === 'permissionschannel') {
            
        }

        if (i.customId === 'editslot') {
            
        }
    });
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