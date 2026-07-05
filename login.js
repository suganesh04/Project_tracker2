document.addEventListener("DOMContentLoaded", () => {
  if (isAuthed()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (login(username, password)) {
      window.location.href = "dashboard.html";
    } else {
      errorEl.textContent = "Incorrect username or password.";
      errorEl.hidden = false;
    }
  });
});
