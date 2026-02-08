const API = "/api";

function showMessage(elId, text, isError) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = "message " + (isError ? "error" : "success");
  el.classList.remove("hidden");
}

function hideMessage(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add("hidden");
}

async function loadConsultations() {
  const list = document.getElementById("consultation-list");
  const empty = document.getElementById("consultation-empty");
  list.innerHTML = "";
  try {
    const res = await fetch(API + "/consultations");
    const data = await res.json();
    if (!data.length) {
      empty.classList.remove("hidden");
      return;
    }
  empty.classList.add("hidden");
    data.forEach((c) => {
      const card = document.createElement("div");
      card.className = "consultation-card";
      card.innerHTML = `
        <div class="info">
          <span class="topic">${escapeHtml(c.topic)}</span>
          <div class="meta">${escapeHtml(c.teacher_name)} · ${c.date} ${c.time || ""} · місць: ${c.max_slots ?? "—"}</div>
        </div>
        <button type="button" data-id="${c.id}">Записатися</button>
      `;
      card.querySelector("button").addEventListener("click", () => openRegister(c));
      list.appendChild(card);
    });
  } catch (e) {
    list.innerHTML = "<p class='message error'>Помилка завантаження: " + e.message + "</p>";
  }
}

function openRegister(consultation) {
  document.getElementById("register-section").classList.remove("hidden");
  document.getElementById("register-consultation-info").textContent =
    consultation.topic + " — " + consultation.teacher_name + ", " + consultation.date + " " + (consultation.time || "");
  document.getElementById("register-form").dataset.consultationId = consultation.id;
  document.getElementById("student-name").value = "";
  hideMessage("register-message");
  loadRegistrations(consultation.id);
}

async function loadRegistrations(consultationId) {
  const section = document.getElementById("registrations-section");
  const list = document.getElementById("registrations-list");
  section.classList.remove("hidden");
  list.innerHTML = "";
  try {
    const res = await fetch(API + "/consultations/" + consultationId + "/registrations");
    const data = await res.json();
    if (data.length) {
      data.forEach((r) => {
        const li = document.createElement("li");
        li.textContent = r.student_name;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>Поки ніхто не зареєстрований.</li>";
    }
  } catch (e) {
    list.innerHTML = "<li>Помилка завантаження списку.</li>";
  }
}

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("register-form").dataset.consultationId;
  const studentName = document.getElementById("student-name").value.trim();
  hideMessage("register-message");
  if (!studentName) {
    showMessage("register-message", "Введіть ім'я.", true);
    return;
  }
  try {
    const res = await fetch(API + "/consultations/" + id + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showMessage("register-message", data.error || "Помилка реєстрації", true);
      return;
    }
    showMessage("register-message", "Ви успішно зареєстровані.", false);
    document.getElementById("student-name").value = "";
    loadRegistrations(id);
    loadConsultations();
  } catch (e) {
    showMessage("register-message", "Помилка: " + e.message, true);
  }
});

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

async function loadHistory() {
  const date = document.getElementById("filter-date").value;
  const status = document.getElementById("filter-status").value;
  const student = document.getElementById("filter-student").value.trim();
  const teacher = document.getElementById("filter-teacher").value.trim();
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  if (student) params.set("student", student);
  if (teacher) params.set("teacher", teacher);
  const list = document.getElementById("history-list");
  try {
    const res = await fetch(API + "/consultations/history?" + params.toString());
    const data = await res.json();
    list.innerHTML = "";
    if (!data.length) {
      list.innerHTML = "<p>Нічого не знайдено.</p>";
      return;
    }
    data.forEach((c) => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `<span class="topic">${escapeHtml(c.topic)}</span> — ${escapeHtml(c.teacher_name)} · ${c.date} ${c.time || ""} · <em>${c.status || "—"}</em>`;
      list.appendChild(div);
    });
  } catch (e) {
    list.innerHTML = "<p class='message error'>Помилка: " + e.message + "</p>";
  }
}

document.getElementById("history-filters").addEventListener("submit", (e) => {
  e.preventDefault();
  loadHistory();
});

async function loadStats() {
  const weekEl = document.getElementById("stats-week");
  const monthEl = document.getElementById("stats-month");
  const teachersEl = document.getElementById("stats-teachers");
  const topicsEl = document.getElementById("stats-topics");

  const set = (el, text) => { el.textContent = text || "—"; };

  try {
    const [week, month, teachers, topics] = await Promise.all([
      fetch(API + "/stats/by-week").then((r) => r.json()),
      fetch(API + "/stats/by-month").then((r) => r.json()),
      fetch(API + "/stats/teachers").then((r) => r.json()),
      fetch(API + "/stats/topics").then((r) => r.json()),
    ]);
    set(weekEl, week.length ? week.map((r) => r.week + ": " + r.total).join("\n") : "Немає даних");
    set(monthEl, month.length ? month.map((r) => r.month + ": " + r.total).join("\n") : "Немає даних");
    set(teachersEl, teachers.length ? teachers.map((r) => r.teacher_name + ": " + r.total).join("\n") : "Немає даних");
    set(topicsEl, topics.length ? topics.map((r) => r.topic + ": " + r.total).join("\n") : "Немає даних");
  } catch (e) {
    set(weekEl, "Помилка");
    set(monthEl, "Помилка");
    set(teachersEl, "Помилка");
    set(topicsEl, "Помилка");
  }
}

loadConsultations();
loadHistory();
loadStats();
