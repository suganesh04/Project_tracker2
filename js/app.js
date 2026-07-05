/* ==========================================================
   Procurement Tracker — shared app logic
   Storage: browser localStorage only (per-device, per-browser,
   no server). Data will NOT sync between different computers
   or browsers.

   Auth: hardcoded credentials below. This is a placeholder —
   anyone who views the page source can read these. Replace
   the `login()` function with a real check (e.g. a fetch()
   call to a Google Apps Script Web App that checks a Google
   Sheet) when you're ready to move off hardcoded logins.
   ========================================================== */

const AUTH_KEY = "pt_auth";
const PROJECTS_KEY = "pt_projects";

// --- Hardcoded credentials (temporary — change these) ---
const CREDENTIALS = [{ username: "admin", password: "procure2026" }];

function login(username, password) {
  const ok = CREDENTIALS.some(
    (c) => {
      return c.username === username && c.password === password;
    }
  );
  if (ok) {
    sessionStorage.setItem(AUTH_KEY, "1");
  }
  return ok;
}

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

function requireAuth() {
  if (!isAuthed()) {
    window.location.href = "index.html";
  }
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}

// --- Data layer (projects) ---
function getProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Could not read saved projects", e);
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

function saveProject(updated) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === updated.id);
  if (idx > -1) {
    projects[idx] = updated;
    saveProjects(projects);
  }
}

// --- Helpers ---
function makeId(prefix) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
