const vcTimes = new Map();
const db = require('../database/db');

module.exports = (client) => {

    client.on('voiceStateUpdate', (oldState, newState) => {

        const userId = newState.id;
        const member = newState.member;

        // ✅ User joined VC
        if (!oldState.channelId && newState.channelId) {

            vcTimes.set(userId, {
                channel: newState.channel.name,
                joinTime: Date.now()
            });

            console.log(`${member.user.tag} joined ${newState.channel.name}`);
        }

        // ✅ User left VC
        if (oldState.channelId && !newState.channelId) {

            const data = vcTimes.get(userId);
            if (!data) return;

            const duration = Date.now() - data.joinTime;
            vcTimes.delete(userId);

            const seconds = Math.floor(duration / 1000);

            console.log(
                `${member.user.tag} left ${data.channel} after ${seconds}s`
            );

            db.run(
    `INSERT INTO vc_time (user_id, channel, duration) VALUES (?, ?, ?)`,
    [userId, data.channel, seconds]
);
        }

        // ✅ User switched VC
        if (oldState.channelId && newState.channelId) {

            const data = vcTimes.get(userId);
            if (!data) return;

            const duration = Date.now() - data.joinTime;
            const seconds = Math.floor(duration / 1000);

            console.log(
                `${member.user.tag} switched from ${oldState.channel.name} to ${newState.channel.name} after ${seconds}s`
            );

            // Reset timer for new channel
            vcTimes.set(userId, {
                channel: newState.channel.name,
                joinTime: Date.now()
            });
        }

    });

};