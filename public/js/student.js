async function getMe() {
  const res = await fetch("/api/auth/me");
  const data = await res.json().catch(() => ({}));
  return data.user || null;
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
        <div class="meta">${c.teacher_name} · ${c.date} ${c.time || ""}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
});

(async () => {
  const me = await getMe();
  document.getElementById("me").textContent = me ? `${me.name} (${me.role})` : "";
  await loadMine();
})();