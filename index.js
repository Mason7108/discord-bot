const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const db = require('./database/db');
require('dotenv').config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});

client.once('clientReady', () => {
    console.log(`Bot online as ${client.user.tag}`);
});

/* ✅ SLASH COMMAND HANDLER */
client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    /* ✅ VC TIME COMMAND */
    if (interaction.commandName === 'vctime') {

        const userId = interaction.user.id;

        db.get(
            `SELECT SUM(duration) AS total FROM vc_time WHERE user_id = ?`,
            [userId],
            (err, row) => {

                if (err) {
                    console.error(err);
                    return interaction.reply('Database error');
                }

                const totalSeconds = row.total || 0;

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                interaction.reply(
                    `You’ve spent **${hours}h ${minutes}m** in VC 😏`
                );
            }
        );
    }

    /* ✅ RAFFLE ENTRY COMMAND */
    if (interaction.commandName === 'enterraffle') {

        const userId = interaction.user.id;

        db.get(
            `SELECT SUM(duration) AS total FROM vc_time WHERE user_id = ?`,
            [userId],
            (err, row) => {

                if (err) {
                    console.error(err);
                    return interaction.reply('Database error');
                }

                const totalSeconds = row.total || 0;

                /* ✅ VC REQUIREMENT CHECK */
                if (totalSeconds < 3600) {
                    return interaction.reply(
                        `❌ You need **at least 1 hour in VC** to enter 😏`
                    );
                }

                /* ✅ ROBLOX CHECK */
                const member = interaction.member;
                const activities = member.presence?.activities || [];

                const playingRoblox = activities.some(
                    act => act.name === 'Roblox'
                );

                if (!playingRoblox) {
                    return interaction.reply(
                        `❌ You must be **playing Roblox** to enter 🎮`
                    );
                }

                /* ✅ SAVE ENTRY */
                db.run(
                    `INSERT OR IGNORE INTO raffle_entries (user_id) VALUES (?)`,
                    [userId]
                );

                interaction.reply(
                    `✅ Entry accepted 😏🎉 Good luck!`
                );
            }
        );
    }
if (interaction.commandName === 'drawraffle') {

    // ✅ Optional Admin Check 😏
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply('❌ Admins only 😏');
    }

    db.get(
        `SELECT user_id FROM raffle_entries ORDER BY RANDOM() LIMIT 1`,
        [],
        (err, row) => {

            if (err) {
                console.error(err);
                return interaction.reply('Database error');
            }

            if (!row) {
                return interaction.reply('❌ No raffle entries found 😏');
            }

            interaction.reply(
                `🎉 WINNER: <@${row.user_id}> 😏🔥`
            );
        }
    );
}
});

/* ✅ LOAD MODULES */
require('./modules/vcTracker')(client);

client.login(process.env.TOKEN);