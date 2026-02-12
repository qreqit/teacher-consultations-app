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
  el.textContent = text;
  el.className = "message " + (isError ? "error" : "success");
  el.classList.remove("hidden");
}

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const { res, json } = await postJSON("/api/auth/register", { name, email, password, role });

  if (!res.ok) return showMsg(json.error || "Registration failed", true);

  const r = json.user?.role;
  if (r === "teacher") window.location.href = "/teacher";
  else window.location.href = "/student";
});