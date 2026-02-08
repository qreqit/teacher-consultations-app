const db = require("../db/database");

exports.byTeacher = (req, res) => {
  db.all(
    `SELECT c.teacher_name, COUNT(r.id) as total
     FROM consultations c
     LEFT JOIN registrations r ON c.id = r.consultation_id
     GROUP BY c.teacher_name
     ORDER BY total DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.byTopic = (req, res) => {
  db.all(
    `SELECT topic, COUNT(*) as total
     FROM consultations
     GROUP BY topic
     ORDER BY total DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.countByMonth = (req, res) => {
  db.all(
    `SELECT substr(date,1,7) as month, COUNT(*) as total
     FROM consultations
     GROUP BY month
     ORDER BY month`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.countByWeek = (req, res) => {
  db.all(
    `SELECT strftime('%Y-%W', date) as week, COUNT(*) as total
     FROM consultations
     GROUP BY week
     ORDER BY week`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};
