const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./src/db/data.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_name TEXT,
            topic TEXT,
            date TEXT,
            time TEXT,
            status TEXT,
            max_slots INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consultation_id INTEGER,
            student_name TEXT
        )
    `);
});

module.exports = db;
