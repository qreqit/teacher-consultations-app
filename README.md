# Teacher Consultations App

> Web app for booking and tracking teacher consultations: view schedule, register students with slot limits, history and statistics.

<br>

| **Stack**     | Node.js · Express · SQLite · HTML/CSS/JS · REST |
| ------------- | ----------------------------------------------- |

---

## Prerequisites

- **Node.js** 18+ (or 20 LTS)
- **npm** (included with Node)

<sub>Check: `node -v` and `npm -v`</sub>

---

## Quick start

```bash
git clone https://github.com/qreqit/teacher-consultations-app.git
cd teacher-consultations-app
npm install
```

On first run, the DB is created at `src/db/data.db` and sample consultations are seeded if empty.

---

## Run

| Mode        | Command        | Use case                    |
| ----------- | -------------- | --------------------------- |
| **Development** | `npm run dev`  | Daily dev, auto-reload      |
| **Production**  | `npm start`   | Deploy or one-off run       |

Then open **http://localhost:3000** in the browser.

<blockquote>
<strong>Tip:</strong> Set port via <code>PORT=4000 npm start</code> (Linux/macOS) or <code>$env:PORT=4000; npm start</code> (PowerShell).
</blockquote>

---

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm start`   | Start server (production)|
| `npm run dev` | Start with nodemon (dev) |
| `npm test`    | Run tests                |

---

## API

<details>
<summary><strong>Consultations</strong></summary>

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/consultations` | List available consultations |
| GET | `/api/consultations/history` | History — query: `date`, `status`, `student`, `teacher` |
| GET | `/api/consultations/:id` | Single consultation |
| GET | `/api/consultations/:id/registrations` | Registered students |
| POST | `/api/consultations/:id/register` | Register — body: `{ "studentName": "..." }` |
| POST | `/api/consultations` | Create consultation |

</details>

<details>
<summary><strong>Statistics</strong></summary>

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/stats/teachers` | Teachers by registration count |
| GET | `/api/stats/topics` | Consultations by topic |
| GET | `/api/stats/by-week` | Count per week |
| GET | `/api/stats/by-month` | Count per month |

</details>

---

## License

**ISC**
