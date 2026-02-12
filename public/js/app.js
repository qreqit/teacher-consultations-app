const API = "/api";
let currentUser = null;

async function initAuth() {
  try {
    const res = await fetch(API + "/auth/me");
    const data = await res.json();
    currentUser = data.user || null;
  } catch {
    currentUser = null;
  }
}

async function doLogout() {
  await fetch(API + "/auth/logout", { method: "POST" });
  window.location.reload();
}

function renderAuthBar() {
  const userEl = document.getElementById("auth-user");
  const loginEl = document.getElementById("auth-login");
  const registerEl = document.getElementById("auth-register");
  const dashEl = document.getElementById("auth-dashboard");
  const logoutEl = document.getElementById("auth-logout");

  if (!userEl || !loginEl || !registerEl || !dashEl || !logoutEl) return;

  if (!currentUser) {
    userEl.textContent = "Guest";
    loginEl.classList.remove("hidden");
    registerEl.classList.remove("hidden");
    dashEl.classList.add("hidden");
    logoutEl.classList.add("hidden");
    return;
  }

  userEl.textContent = `${currentUser.name} (${currentUser.role})`;
  loginEl.classList.add("hidden");
  registerEl.classList.add("hidden");

  dashEl.classList.remove("hidden");
  dashEl.href = currentUser.role === "teacher" ? "/teacher" : "/student";

  logoutEl.classList.remove("hidden");
  logoutEl.onclick = doLogout;
}

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
      const canRegister = currentUser && currentUser.role === "student";
      card.innerHTML = `
        <div class="info">
          <span class="topic">${escapeHtml(c.topic)}</span>
          <div class="meta">${escapeHtml(c.teacher_name)} · ${c.date} ${c.time || ""} · місць: ${c.max_slots ?? "—"}</div>
        </div>
        ${canRegister ? `<button type="button" data-id="${c.id}">Записатися</button>` : ``}
      `;
        const btn = card.querySelector("button");
        if (btn) btn.addEventListener("click", () => {
        if (!currentUser) {
          window.location.href = "/login";
          return;
        }
        if (currentUser.role !== "student") {
          alert("Запис доступний лише для студентів");
          return;
        }
        openRegister(c);
      });
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

async function getMe() {
  const res = await fetch("/api/auth/me");
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.reload();
}

function setAuthBar(user) {
  const userEl = document.getElementById("auth-user");
  const loginEl = document.getElementById("auth-login");
  const registerEl = document.getElementById("auth-register");
  const logoutEl = document.getElementById("auth-logout");

  if (!user) {
    if (userEl) userEl.textContent = "Guest";
    if (loginEl) loginEl.classList.remove("hidden");
    if (registerEl) registerEl.classList.remove("hidden");
    if (logoutEl) logoutEl.classList.add("hidden");
    return;
  }

  if (userEl) userEl.textContent = `${user.name} (${user.role})`;
  if (loginEl) loginEl.classList.add("hidden");
  if (registerEl) registerEl.classList.add("hidden");
  if (logoutEl) {
    logoutEl.classList.remove("hidden");
    logoutEl.onclick = logout;
  }
}

(async () => {
  await initAuth();
  renderAuthBar();
  await loadConsultations();
})();
loadHistory();
loadStats();
