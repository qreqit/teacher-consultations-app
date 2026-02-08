const db = require("../db/database");

exports.getAll = (req, res) => {
    db.all("SELECT * FROM consultations ORDER BY date, time", [], (err, rows) => {
        res.json(rows);
    });
};

exports.create = (req, res) => {
    const { teacher_name, topic, date, time, status, max_slots } = req.body;

    db.run(
        `INSERT INTO consultations (teacher_name, topic, date, time, status, max_slots)
         VALUES (?,?,?,?,?,?)`,
        [teacher_name, topic, date, time, status, max_slots],
        function () {
            res.json({ id: this.lastID });
        }
    );
};

exports.register = (req, res) => {
    const { consultationId, studentName } = req.body;

    db.get(
        "SELECT max_slots, (SELECT COUNT(*) FROM registrations WHERE consultation_id=?) as used FROM consultations WHERE id=?",
        [consultationId, consultationId],
        (err, row) => {
            if (!row || row.used >= row.max_slots) {
                return res.status(400).json({ error: "No slots" });
            }

            db.run(
                "INSERT INTO registrations (consultation_id, student_name) VALUES (?,?)",
                [consultationId, studentName],
                () => res.json({ ok: true })
            );
        }
    );
};

exports.history = (req, res) => {
    const { date, status } = req.query;

    let sql = "SELECT * FROM consultations WHERE 1=1";
    const params = [];

    if (date) {
        sql += " AND date = ?";
        params.push(date);
    }

    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }

    sql += " ORDER BY date DESC";

    db.all(sql, params, (err, rows) => {
        res.json(rows);
    });
};

exports.getRegistrations = (req, res) => {
    const id = req.params.id;

    db.all(
        "SELECT student_name FROM registrations WHERE consultation_id=?",
        [id],
        (err, rows) => res.json(rows)
    );
};
