const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const publicPath = path.join(__dirname, "..", "public");
const viewsPath = path.join(__dirname, "..", "views");

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(viewsPath, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const consultationRoutes = require("./routes/consultationRoutes");
const statsRoutes = require("./routes/statsRoutes");

app.use("/api/consultations", consultationRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
