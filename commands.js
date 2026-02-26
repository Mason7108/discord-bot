const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [

    new SlashCommandBuilder()
        .setName('vctime')
        .setDescription('Shows your total VC time'),

    new SlashCommandBuilder()
        .setName('enterraffle')
        .setDescription('Enter the Robux raffle'),

    new SlashCommandBuilder()
        .setName('drawraffle')
        .setDescription('Draw a raffle winner')

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands('1474958097758814279', '1464407553067978887'),
            { body: commands }
        );

        console.log('Slash commands registered 😏');

    } catch (error) {
        console.error(error);
    }
})();