const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

const publicPath = path.join(__dirname, "..", "public");
const viewsPath = path.join(__dirname, "..", "views");

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(viewsPath, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(viewsPath, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(viewsPath, "register.html"));
});

const consultationRoutes = require("./routes/consultationRoutes");
const statsRoutes = require("./routes/statsRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
