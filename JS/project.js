document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  let project = projectId ? getProject(projectId) : null;

  if (!project) {
    window.location.href = "dashboard.html";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  const titleEl = document.getElementById("project-title");
  const stampEl = document.getElementById("project-stamp");
  const vendorList = document.getElementById("vendor-list");
  const addVendorForm = document.getElementById("add-vendor-form");
  const vendorEmailInput = document.getElementById("vendor-email-input");
  const table = document.getElementById("compare-table");

  logoutBtn.addEventListener("click", logout);

  const STATUS_LABELS = {
    neutral: "Not started",
    yellow: "In progress",
    green: "Quotation received",
    red: "Declined",
  };

  const ROWS = [
    { label: "Vendor Name", field: "vendorName" },
    { label: "Price", field: "price" },
    { label: "Lead Time", field: "leadTime" },
    { label: "Payment Terms", field: "paymentTerms" },
    { label: "COO", field: "coo" },
    { label: "Remarks", field: "remarks" },
  ];

  function persist() {
    saveProject(project);
  }

  // ---------- Header ----------
  function renderHeader() {
    titleEl.textContent = project.name;
    stampEl.textContent = formatDate(project.sentDate);
  }

  titleEl.addEventListener("blur", () => {
    const newName = titleEl.textContent.trim();
    project.name = newName || "Untitled project";
    titleEl.textContent = project.name;
    persist();
  });

  titleEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleEl.blur();
    }
  });

  // ---------- Vendor tracker ----------
  function upvote(vendor) {
    if (vendor.status === "neutral") vendor.status = "yellow";
    else if (vendor.status === "yellow") vendor.status = "green";
    // green stays green; red stays red (downvote always wins)
  }

  function downvote(vendor) {
    vendor.status = "red";
  }

  function resetVendor(vendor) {
    vendor.status = "neutral";
  }

  function renderVendors() {
    vendorList.innerHTML = "";

    if (!project.vendors || project.vendors.length === 0) {
      vendorList.innerHTML = `<div class="vendor-empty">No vendors added yet. Add a vendor email below to start tracking.</div>`;
      return;
    }

    project.vendors.forEach((vendor) => {
      const row = document.createElement("div");
      row.className = "vendor-row";
      row.dataset.status = vendor.status;
      row.dataset.id = vendor.id;
      row.innerHTML = `
        <span class="status-dot dot-${vendor.status}"></span>
        <span class="vendor-email">${escapeHtml(vendor.email)}</span>
        <span class="vendor-status-label">${STATUS_LABELS[vendor.status]}</span>
        <div class="vendor-actions">
          <button type="button" class="vote-btn upvote" title="Upvote">&#9650;</button>
          <button type="button" class="vote-btn downvote" title="Downvote">&#9660;</button>
          <button type="button" class="vote-btn reset" title="Reset to neutral">&#8634;</button>
          <button type="button" class="vote-btn delete" title="Remove vendor">&#10005;</button>
        </div>
      `;

      row.querySelector(".upvote").addEventListener("click", () => {
        upvote(vendor);
        persist();
        renderVendors();
      });
      row.querySelector(".downvote").addEventListener("click", () => {
        downvote(vendor);
        persist();
        renderVendors();
      });
      row.querySelector(".reset").addEventListener("click", () => {
        resetVendor(vendor);
        persist();
        renderVendors();
      });
      row.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Remove ${vendor.email}?`)) return;
        project.vendors = project.vendors.filter((v) => v.id !== vendor.id);
        persist();
        renderVendors();
      });

      vendorList.appendChild(row);
    });
  }

  addVendorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = vendorEmailInput.value.trim();
    if (!email) return;

    if (!project.vendors) project.vendors = [];
    project.vendors.push({
      id: makeId("vendor"),
      email,
      status: "neutral",
    });
    persist();
    vendorEmailInput.value = "";
    renderVendors();
  });

  // ---------- Comparison table ----------
  function renderTable() {
    const columns = project.comparisonColumns || [];

    let html = "<thead><tr><th class=\"row-label-col\"></th>";
    columns.forEach((col, i) => {
      html += `<th>Vendor ${i + 1}<button type="button" class="remove-col-btn" data-col="${col.id}" title="Remove column">&#10005;</button></th>`;
    });
    html += `<th class="add-col-cell"><button type="button" id="add-col-btn" class="add-col-btn">+ Add vendor column</button></th>`;
    html += "</tr></thead><tbody>";

    ROWS.forEach((row) => {
      html += `<tr><td class="row-label">${row.label}</td>`;
      columns.forEach((col) => {
        const value = col[row.field] || "";
        html += `<td contenteditable="true" data-placeholder="—" data-col="${col.id}" data-field="${row.field}">${escapeHtml(value)}</td>`;
      });
      html += "</tr>";
    });

    html += "</tbody>";
    table.innerHTML = html;

    table.querySelectorAll(".remove-col-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const colId = btn.dataset.col;
        if (!confirm("Remove this vendor column from the comparison table?")) return;
        project.comparisonColumns = project.comparisonColumns.filter((c) => c.id !== colId);
        persist();
        renderTable();
      });
    });

    table.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.addEventListener("blur", () => {
        const colId = cell.dataset.col;
        const field = cell.dataset.field;
        const col = project.comparisonColumns.find((c) => c.id === colId);
        if (col) {
          col[field] = cell.textContent.trim();
          persist();
        }
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          cell.blur();
        }
      });
    });

    const addColBtn = document.getElementById("add-col-btn");
    if (addColBtn) {
      addColBtn.addEventListener("click", () => {
        if (!project.comparisonColumns) project.comparisonColumns = [];
        project.comparisonColumns.push({
          id: makeId("col"),
          vendorName: "",
          price: "",
          leadTime: "",
          paymentTerms: "",
          coo: "",
          remarks: "",
        });
        persist();
        renderTable();
      });
    }
  }

  renderHeader();
  renderVendors();
  renderTable();
});
