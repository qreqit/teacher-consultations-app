const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "data.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_name TEXT,
      topic TEXT,
      date TEXT,
      time TEXT,
      status TEXT DEFAULT 'scheduled',
      max_slots INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultation_id INTEGER,
      student_name TEXT,
      FOREIGN KEY (consultation_id) REFERENCES consultations(id)
    )
  `);

  db.get("SELECT COUNT(*) as n FROM consultations", [], (err, row) => {
    if (err || !row || row.n > 0) return;
    const now = new Date();
    const d = (n) => {
      const x = new Date(now);
      x.setDate(x.getDate() + n);
      return x.toISOString().slice(0, 10);
    };
    db.run(
      `INSERT INTO consultations (teacher_name, topic, date, time, status, max_slots) VALUES
       ('Іванова О.П.', 'Математичний аналіз', ?, '10:00', 'scheduled', 5),
       ('Петренко В.І.', 'Програмування', ?, '14:00', 'scheduled', 10),
       ('Коваленко Т.С.', 'Бази даних', ?, '11:30', 'scheduled', 8)`,
      [d(1), d(2), d(3)],
      () => console.log("Sample consultations seeded.")
    );
  });
});

module.exports = db;
