const fs = require('fs');
const { Client, Events, GatewayIntentBits, ActivityType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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

client.on(Events.ClientReady, () => {
    console.log(`Bot logged in as ${client.user.tag}!`);
    connectModules();
    client.user.setPresence({ activities: [{ 
        name: `Madness Project | version ${require('./package.json').version}`,
        type: ActivityType.Custom
    }], status: 'dnd' });

    const guild = client.guilds.cache.get(config.Guild_id);

    if (guild.channels.cache.get(configLobby.id_settingsRooms)) {
        //Изменние название канала
        
        const collector = guild.channels.cache.get(configLobby.id_settingsRooms).createMessageComponentCollector({filter});
            
        collector.on('collect', async i => {
            if (i.customId === 'editname') {
                if(i.member.voice.channel){
                    if (guild.channels.cache.get(i.member.voice.channelId).permissionOverwrites.cache.get(i.member.id)) {

                        const inputeditname = new TextInputBuilder()
                            .setCustomId(`inputeditname`)
                            .setLabel(`Название канала`)
                            .setPlaceholder(`Введите название канала`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)

                        const modal = new ModalBuilder()
                            .setCustomId('modaleditname')
                            .setTitle('Изменить название канала')
                            .setComponents(
                                new ActionRowBuilder().addComponents(inputeditname)
                            )

                        await i.showModal(modal);

                        const submitted = await i.awaitModalSubmit({
                            time: 60000,
                            filter: interaction => interaction.user.id === i.user.id,
                        }).catch(error => {
                            console.error(error)
                            return null;
                        })
                        
                        if (submitted) {
                            const newName = submitted.fields.getTextInputValue("inputeditname");
                            
                            guild.channels.cache.get(i.member.voice.channelId).edit({
                                name: newName
                            })
                            .then(() => {
                                submitted.reply({content: "Название канала изменилось", ephemeral: true});
                            })
                            .catch(err => {
                                console.log(err);
                                submitted.reply({content: "Возникла ошибка", ephemeral: true});
                            })
                        }
                    }else{
                        await i.reply({content: 'У вас нету прав поменять название канал, вы не владелец канала!', ephemeral: true});
                    }
                }else{
                    await i.reply({content: 'Зайдите в свой созданный канал чтобы использовать данную функцию', ephemeral: true});
                }
            }
        
            if (i.customId === 'permissionschannel') {
                
            }
        
            if (i.customId === 'editslot') {
                
            }
        });
    }
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