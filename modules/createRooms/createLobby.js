const { client, checkRole, Rewriting } = require("../../start.js");
let config = require('../../Config/config.json');
let lobbyConfig = require('../createRooms/config.json');
const {ActionRowBuilder, SlashCommandBuilder, ChannelType, Events, PermissionsBitField } = require("discord.js");
const guild = client.guilds.cache.get(config.Guild_id);

/* Создать бота у которого будет команда createlobby (команда для создания первоначальных каналов) будут параметры: название канала, сколько слотов

после чего человек заходить в лобби допустим 2 на 2 и ему создаётся автоматом комната два на два и ставится название 💞парная и тд и так для всех комнат, также будет иметься панель управление в виде отдельного чата с кнопками на редактирования каналов, функции будут доступны некоторые обычным пользователям некоторые для нас с зирой */

const createRoom = new SlashCommandBuilder()
    .setName("createlobby")
    .setDescription("Создать комнат (доступен только администраторам)")
    .addStringOption(option => option
        .setName("namelobby")
        .setDescription('Укажите название для лобби')
		.setRequired(true)
    )
    .addIntegerOption(option => option
        .setName("countmember")
        .setDescription("Укажите кол-во слотов (0 - 99)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(99)
    )
    .addStringOption(option => option
        .setName("standartnamechannel")
        .setDescription("Укажите Стандартное название для каналов")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(8);

    client.application.commands.create(createRoom, config.Guild_id)

client.on(Events.InteractionCreate, async (i) => {
    if (!i.isCommand()) return;

    if (i.commandName === "createlobby") {
        if (checkRole(i)) {
            let namelobby = i.options.getString("namelobby");
            let countMember = i.options.getInteger("countmember");
            let standartName = i.options.getString("standartnamechannel");
                
            CreateRooms(namelobby, countMember, standartName);
            await i.reply({content: `Лобби с названием ${namelobby} создан${(countMember) ? `, кол-во слотов ${countMember}` : "."}`, ephemeral: true }).catch(error => {
                console.log(error);
            });
        }
    }
});


function CreateRooms(namelobby, countMember, standartName) {
    guild.channels.create({
        name: namelobby,
        type: ChannelType.GuildVoice,
        userLimit: countMember,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [
                    PermissionsBitField['Flags'].ViewChannel,
                    PermissionsBitField['Flags'].Connect,
                ]
            }
        ],
        parent: config.parenId,
    })
    .then(channel => {
        lobbyConfig['Rooms'].push(
            {
                "name": namelobby,
                "id":`${channel.id}`,
                "standartName": standartName
            }
        );
        Rewriting('./modules/createRooms/config.json', lobbyConfig);
    })
    .catch((error) => {
        console.log(error);
    })
    
    return;
}

function checkNameChannel(oldstate, lobbyConfig) {
    for (let i = 0; i < lobbyConfig.Rooms.length; i++) {
        if (oldstate.channel.name == lobbyConfig.Rooms[i].name) {
            return 0;
        }
    }
    return 1;
}

client.on(Events.VoiceStateUpdate, async (oldstate, newstate) => {
    for (let i = 0; i < lobbyConfig.Rooms.length; i++) {
        if (newstate.channel && newstate.channel.id == lobbyConfig.Rooms[i].id) {
            guild.channels.create({
                name: lobbyConfig.Rooms[i].standartName,
                type: ChannelType.GuildVoice,
                userLimit: newstate.channel.userLimit,
                parent: config.parenId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [
                            PermissionsBitField['Flags'].ViewChannel,
                            PermissionsBitField['Flags'].Connect,
                        ]
                    }
                ]
            }).then((channel) => {
                setTimeout(() => {
                    newstate.member.voice.setChannel(channel.id);
                }, 3000);
            });
            return 0;
        }
    }

    if (oldstate.channel && oldstate.channel.parentId == config.parenId) {
        if (oldstate.channel.members.size == 0) {
            console.log(oldstate.channel.name);
            if (checkNameChannel(oldstate, lobbyConfig)) {
                oldstate.channel.delete();
            }
        }
    }
});




