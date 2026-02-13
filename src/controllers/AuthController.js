const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.me = (req, res) => {
  const u = req.session.user || null;
  res.json({ user: u });
};

exports.register = (req, res) => {
  const { name, email, password, role } = req.body || {};
  const r = role === "teacher" ? "teacher" : "student";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password are required" });
  }

  User.findByEmail(email.trim().toLowerCase(), (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const password_hash = bcrypt.hashSync(password, 10);
    User.create(
      { name: name.trim(), email: email.trim().toLowerCase(), password_hash, role: r },
      (err2, created) => {
        if (err2) return res.status(500).json({ error: err2.message });

        req.session.user = { id: created.id, name: name.trim(), role: r };
        res.status(201).json({ ok: true, user: req.session.user });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  User.findByEmail(email.trim().toLowerCase(), (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.json({ ok: true, user: req.session.user });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
};