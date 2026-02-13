const db = require("../db/database");

exports.findByEmail = (email, cb) => {
  db.get("SELECT * FROM users WHERE email = ?", [email], cb);
};

exports.findById = (id, cb) => {
  db.get("SELECT id, name, email, role FROM users WHERE id = ?", [id], cb);
};

exports.create = ({ name, email, password_hash, role }, cb) => {
  db.run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
    [name, email, password_hash, role],
    function (err) {
      if (err) return cb(err);
      cb(null, { id: this.lastID });
    }
  );
};