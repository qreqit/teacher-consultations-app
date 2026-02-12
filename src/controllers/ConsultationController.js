const db = require("../db/database");

exports.getAll = (req, res) => {
  db.all(
    "SELECT * FROM consultations WHERE status = 'scheduled' ORDER BY date, time",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.getById = (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM consultations WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Consultation not found" });
    res.json(row);
  });
};

exports.create = (req, res) => {
  const { topic, date, time, status, max_slots } = req.body;
  const teacher_name = req.session.user.name;

  const st = status || "scheduled";
  const slots = max_slots != null ? max_slots : 10;

  if (!teacher_name || !teacher_name.trim()) {
    return res.status(400).json({ error: "User name is missing" });
  }

  db.run(
    `INSERT INTO consultations (teacher_name, topic, date, time, status, max_slots)
     VALUES (?,?,?,?,?,?)`,
    [teacher_name.trim(), topic, date, time, st, slots],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

exports.register = (req, res) => {
  const consultationId = req.params.id || req.body.consultationId;
  const studentName = req.session.user.name;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ error: "Student name is required" });
  }

  db.get(
    "SELECT max_slots, (SELECT COUNT(*) FROM registrations WHERE consultation_id=?) as used FROM consultations WHERE id=?",
    [consultationId, consultationId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Consultation not found" });
      if (row.used >= row.max_slots) {
        return res.status(400).json({ error: "No slots available" });
      }

      db.run(
        "INSERT INTO registrations (consultation_id, student_name) VALUES (?,?)",
        [consultationId, studentName.trim()],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ ok: true, id: this.lastID });
        }
      );
    }
  );
};

exports.history = (req, res) => {
  const { date, status, student, teacher } = req.query;

  let sql;
  const params = [];

  if (student) {
    sql = `
      SELECT c.* FROM consultations c
      INNER JOIN registrations r ON c.id = r.consultation_id
      WHERE r.student_name = ?
    `;
    params.push(student);
  } else {
    sql = "SELECT * FROM consultations WHERE 1=1";
  }

  if (date) {
    sql += student ? " AND c.date = ?" : " AND date = ?";
    params.push(date);
  }
  if (status) {
    sql += student ? " AND c.status = ?" : " AND status = ?";
    params.push(status);
  }
  if (teacher) {
    sql += student ? " AND c.teacher_name = ?" : " AND teacher_name = ?";
    params.push(teacher);
  }

  sql += student
    ? " ORDER BY c.date DESC, c.time DESC"
    : " ORDER BY date DESC, time DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
};

exports.getRegistrations = (req, res) => {
  const id = req.params.id;
  db.all(
    "SELECT id, student_name FROM registrations WHERE consultation_id=? ORDER BY id",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};
