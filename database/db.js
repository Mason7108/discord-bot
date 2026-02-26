const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/stats.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite database');
});

db.run(`
    CREATE TABLE IF NOT EXISTS vc_time (
        user_id TEXT,
        channel TEXT,
        duration INTEGER
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS raffle_entries (
        user_id TEXT UNIQUE
    )
`);

module.exports = db;