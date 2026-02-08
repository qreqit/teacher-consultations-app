const db = require("../db/database");

exports.byTeacher = (req, res) => {
    db.all(`
        SELECT teacher_name, COUNT(r.id) as total
        FROM consultations c
        LEFT JOIN registrations r ON c.id = r.consultation_id
        GROUP BY teacher_name
        ORDER BY total DESC
    `, [], (err, rows) => res.json(rows));
};

exports.byTopic = (req, res) => {
    db.all(`
        SELECT topic, COUNT(*) as total
        FROM consultations
        GROUP BY topic
        ORDER BY total DESC
    `, [], (err, rows) => res.json(rows));
};

exports.countByMonth = (req, res) => {
    db.all(`
        SELECT substr(date,1,7) as month, COUNT(*) as total
        FROM consultations
        GROUP BY month
    `, [], (err, rows) => res.json(rows));
};
