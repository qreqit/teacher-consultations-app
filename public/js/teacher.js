async function getMe() {
  const res = await fetch("/api/auth/me");
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

function showMsg(text, isError) {
  const el = document.getElementById("msg");
  if (!el) return;
  el.textContent = text;
  el.className = "message " + (isError ? "error" : "success");
  el.classList.remove("hidden");
}

async function loadRegistrations(consultationId) {
  const list = document.getElementById("regs-list");
  const empty = document.getElementById("regs-empty");
  list.innerHTML = "";

  const res = await fetch(`/api/consultations/${consultationId}/registrations`);
  const data = await res.json().catch(() => []);

  if (!res.ok) {
    showMsg(data.error || "Failed to load registrations", true);
    empty.classList.remove("hidden");
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  data.forEach((r) => {
    const div = document.createElement("div");
    div.className = "consultation-card";
    div.innerHTML = `
      <div class="info">
        <span class="topic">${r.student_name}</span>
        <div class="meta">registration id: ${r.id}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

async function loadMine() {
  const list = document.getElementById("mine-list");
  const empty = document.getElementById("mine-empty");
  list.innerHTML = "";

  const res = await fetch("/api/consultations/mine");
  const data = await res.json().catch(() => []);

  if (!Array.isArray(data) || data.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  data.forEach((c) => {
    const div = document.createElement("div");
    div.className = "consultation-card";
    div.innerHTML = `
        <div class="info">
            <span class="topic">${c.topic}</span>
            <div class="meta">${c.teacher_name} · ${c.date} ${c.time || ""} · slots: ${c.max_slots ?? "—"}</div>
        </div>
        <button type="button" data-id="${c.id}">View registrations</button>
    `;
    const btn = div.querySelector("button");
    btn.addEventListener("click", async () => {
        await loadRegistrations(c.id);
    });
    list.appendChild(div);
  });
}

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
});

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const topic = document.getElementById("topic").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const max_slots = Number(document.getElementById("max_slots").value);

  const { res, json } = await postJSON("/api/consultations", {
    topic,
    date,
    time,
    max_slots,
  });

  if (!res.ok) {
    return showMsg(json.error || "Create failed", true);
  }

  showMsg("Created", false);
  e.target.reset();
  document.getElementById("max_slots").value = 10;
  await loadMine();
});

(async () => {
  const me = await getMe();
  document.getElementById("me").textContent = me ? `${me.name} (${me.role})` : "";
  await loadMine();
})();