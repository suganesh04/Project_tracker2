document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const grid = document.getElementById("project-grid");
  const emptyState = document.getElementById("empty-state");
  const addBtn = document.getElementById("add-project-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const modal = document.getElementById("project-modal");
  const form = document.getElementById("project-form");
  const cancelBtn = document.getElementById("cancel-project-btn");

  logoutBtn.addEventListener("click", logout);

  function statusCounts(vendors) {
    const counts = { yellow: 0, green: 0, red: 0, neutral: 0 };
    (vendors || []).forEach((v) => {
      if (counts[v.status] !== undefined) counts[v.status]++;
    });
    return counts;
  }

  function render() {
    const projects = getProjects().sort((a, b) =>
      (b.sentDate || "").localeCompare(a.sentDate || "")
    );
    grid.innerHTML = "";
    emptyState.hidden = projects.length > 0;

    projects.forEach((project) => {
      const counts = statusCounts(project.vendors);
      const total = (project.vendors || []).length;

      const card = document.createElement("a");
      card.href = `project.html?id=${encodeURIComponent(project.id)}`;
      card.className = "project-card";
      card.innerHTML = `
        <div class="stamp">${formatDate(project.sentDate)}</div>
        <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
        <div class="vendor-summary">
          <span class="dot dot-yellow"></span>${counts.yellow}
          <span class="dot dot-green"></span>${counts.green}
          <span class="dot dot-red"></span>${counts.red}
          <span class="vendor-total">${total} vendor${total === 1 ? "" : "s"}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  addBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("project-sent-date").valueAsDate = new Date();
    modal.showModal();
  });

  cancelBtn.addEventListener("click", () => modal.close());

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("project-name").value.trim();
    const sentDate = document.getElementById("project-sent-date").value;
    if (!name || !sentDate) return;

    const projects = getProjects();
    projects.push({
      id: makeId("proj"),
      name,
      sentDate,
      vendors: [],
      comparisonColumns: [],
    });
    saveProjects(projects);
    modal.close();
    render();
  });

  render();
});
