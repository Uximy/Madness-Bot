const { client, checkRole, Rewriting } = require("../../start.js");
let config = require('../../Config/config.json');
let lobbyConfig = require('../createRooms/config.json');
const {ActionRowBuilder, SlashCommandBuilder, ChannelType, Events, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
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

    client.application.commands.create(createRoom, config.Guild_id);


    // function ButtonsSettingsRoom()
    // {
    //     const editName = new ButtonBuilder()
    //         .setCustomId("editname")
    //         .setStyle(ButtonStyle.Secondary)
    //         .setEmoji("📝")

    //     const permissionsChannel = new ButtonBuilder()
    //         .setCustomId("permissionschannel")
    //         .setStyle(ButtonStyle.Secondary)
    //         .setEmoji("🔒")

    //     const editSlot = new ButtonBuilder()
    //         .setCustomId("editslot")
    //         .setStyle(ButtonStyle.Secondary)
    //         .setEmoji("👥")

    //     return [editName, editSlot, permissionsChannel];
    // }

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
        if (!guild.channels.cache.filter(channel => channel.name === "🛠║управление-каналом").size) {
            guild.channels.create({
                name: "🛠️║управление-каналом",
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [
                            PermissionsBitField['Flags'].ViewChannel,
                            PermissionsBitField['Flags'].SendMessages,
                            PermissionsBitField['Flags'].SendMessagesInThreads,
                            PermissionsBitField['Flags'].SendTTSMessages
                        ]
                    }
                ],
                parent: config.parenId,
                position: 0
            }).then(channel => {
                lobbyConfig.id_settingsRooms = channel.id;
                Rewriting('./modules/createRooms/config.json', lobbyConfig);

                const settingsMessage = new EmbedBuilder()
                    .setColor('#FA747D')
                    .setTitle("Управление каналом") 
                    .setAuthor({name: client.user.displayName, url: "https://discord.gg/phBaXpBhkq", iconURL: client.user.displayAvatarURL()})
                    .setDescription(`описание кнопок`)

                    let buttons = ButtonsSettingsRoom();

                    channel.send({embeds: [settingsMessage], components: [new ActionRowBuilder().addComponents(...buttons)]});
            })
            .catch(err => {
                console.log(err);
            })
        }
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

            //Удаляем канал пользователя когда он с своего канала переходит в лобби каналы
            if (oldstate.channel && oldstate.channel.parentId == config.parenId) {
                if (newstate.channel.id == lobbyConfig.Rooms[i].id && oldstate.channel.members.size == 0) {
                    oldstate.channel.delete();
                }
            }

            /*Создаём канал пользователю когда он заходит в каналы лобби 
            и выставляем слот на канал в зависимости от того в какой лобби зашёл пользователь*/
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
                //Переносим пользователя в созданный канал
                newstate.member.voice.setChannel(channel.id);
            });
            return 0;
        }
    }

    //Удаляем созданный канал пользователем когда он выходит из самого канала
    if (oldstate.channel && oldstate.channel.parentId == config.parenId) {
        if (oldstate.channel.members.size == 0) {
            const oldchannel = oldstate.channel;
            if (checkNameChannel(oldstate, lobbyConfig)) {
                oldstate.channel.delete();
            }
        }
    }
});

//Управление комнатой
// const filter = async (i) => 
//     i.customId === 'createticket' ||
//     i.customId === 'closeticket';


// const collector = guild.channels.cache.find(channel => channel.name === "🛠║управление-каналом").createMessageComponentCollector({filter})
        
// collector.on('collect', async i => {
//     if (i.customId === 'createticket') {
//         if (i.member.roles.cache.some(role => role.name === 'Muted')) {
//             i.reply({content: `У вас присутствует роль ${guild.roles.cache.find(muted => muted.name === "Muted").toString()}, вы не можете создавать тикеты.`, ephemeral: true});
//         }else{
//             createTicket(guild, i);
//         }
//     }
// });