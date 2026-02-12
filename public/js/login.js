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

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { res, json } = await postJSON("/api/auth/login", { email, password });

  if (!res.ok) return showMsg(json.error || "Login failed", true);

  const role = json.user?.role;
  if (role === "teacher") window.location.href = "/teacher";
  else if (role === "student") window.location.href = "/student";
  else window.location.href = "/";
});