const API = {
  expenses: "/expenses",
  report: "/expenses/report",
};

const CATEGORIES = ["FOOD", "TRAVEL", "BILLS", "SHOPPING", "HEALTH", "ENTERTAINMENT", "OTHER"];

let expensesCache = [];

function fmtMoney(n) {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(msg) {
  const el = document.getElementById("appToast");
  document.getElementById("toastBody").textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
}

function setFormError(msg) {
  const el = document.getElementById("formError");
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.style.display = "block";
  el.textContent = msg;
}

function fillCategoryOptions() {
  const select = document.getElementById("category");
  const filter = document.getElementById("categoryFilter");
  select.innerHTML = "";
  for (const c of CATEGORIES) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0) + c.slice(1).toLowerCase();
    select.appendChild(opt);
  }
  for (const c of CATEGORIES) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0) + c.slice(1).toLowerCase();
    filter.appendChild(opt);
  }
}

function applyFilters(items) {
  const q = (document.getElementById("searchBox").value || "").trim().toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  return items.filter((e) => {
    const matchesCat = !cat || e.category === cat;
    const hay = `${e.category} ${e.description}`.toLowerCase();
    const matchesQ = !q || hay.includes(q);
    return matchesCat && matchesQ;
  });
}

function renderTable() {
  const tbody = document.getElementById("expensesTbody");
  const items = applyFilters(expensesCache);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">No expenses found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map((e) => {
      return `
        <tr class="clickable-row" data-id="${e.id}">
          <td>${e.id}</td>
          <td>${escapeHtml(e.date)}</td>
          <td><span class="badge badge-soft">${escapeHtml(e.category)}</span></td>
          <td>${escapeHtml(e.description)}</td>
          <td class="text-end">${fmtMoney(e.amount)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-light me-2" data-action="edit" data-id="${e.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${e.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderReport(report) {
  document.getElementById("totalExpenses").textContent = fmtMoney(report.totalExpenses);

  const catEl = document.getElementById("categoryReport");
  const cats = report.categoryWiseExpenses || {};
  const catLines = Object.entries(cats)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => `<div class="d-flex justify-content-between"><span>${escapeHtml(k)}</span><span>${fmtMoney(v)}</span></div>`);
  catEl.innerHTML = catLines.length ? catLines.join("") : `<div class="muted">No data</div>`;

  const monthEl = document.getElementById("monthlyReport");
  const months = report.monthlySummary || {};
  const monthLines = Object.entries(months)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([k, v]) => `<div class="d-flex justify-content-between"><span>${escapeHtml(k)}</span><span>${fmtMoney(v)}</span></div>`);
  monthEl.innerHTML = monthLines.length ? monthLines.join("") : `<div class="muted">No data</div>`;
}

async function fetchJson(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.validationErrors ? Object.values(data.validationErrors).join(", ") : null) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function refreshAll() {
  const [expenses, report] = await Promise.all([
    fetchJson(API.expenses),
    fetchJson(API.report),
  ]);
  expensesCache = expenses;
  renderTable();
  renderReport(report);
}

function openModal(mode, expense) {
  setFormError("");
  document.getElementById("modalTitle").textContent = mode === "edit" ? "Edit expense" : "Add expense";
  document.getElementById("expenseId").value = expense?.id ?? "";
  document.getElementById("amount").value = expense?.amount ?? "";
  document.getElementById("category").value = expense?.category ?? "FOOD";
  document.getElementById("description").value = expense?.description ?? "";
  document.getElementById("date").value = expense?.date ?? new Date().toISOString().slice(0, 10);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("expenseModal")).show();
}

async function saveExpense() {
  setFormError("");
  const id = document.getElementById("expenseId").value;
  const payload = {
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value,
  };

  try {
    if (!payload.amount || payload.amount <= 0) throw new Error("Amount must be greater than 0");
    if (!payload.description) throw new Error("Description is required");
    if (!payload.date) throw new Error("Date is required");

    if (id) {
      await fetchJson(`${API.expenses}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Expense updated");
    } else {
      await fetchJson(API.expenses, { method: "POST", body: JSON.stringify(payload) });
      showToast("Expense added");
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("expenseModal")).hide();
    await refreshAll();
  } catch (e) {
    setFormError(e.message || "Failed to save");
  }
}

async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  try {
    await fetchJson(`${API.expenses}/${id}`, { method: "DELETE" });
    showToast("Expense deleted");
    await refreshAll();
  } catch (e) {
    showToast(e.message || "Failed to delete");
  }
}

function findExpenseById(id) {
  return expensesCache.find((e) => String(e.id) === String(id));
}

document.addEventListener("DOMContentLoaded", async () => {
  fillCategoryOptions();

  document.getElementById("addBtn").addEventListener("click", () => openModal("add", null));
  document.getElementById("saveBtn").addEventListener("click", saveExpense);
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    try { await refreshAll(); } catch (e) { showToast(e.message || "Refresh failed"); }
  });

  document.getElementById("searchBox").addEventListener("input", renderTable);
  document.getElementById("categoryFilter").addEventListener("change", renderTable);

  document.getElementById("expensesTbody").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (btn) {
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (action === "edit") openModal("edit", findExpenseById(id));
      if (action === "delete") deleteExpense(id);
      ev.stopPropagation();
      return;
    }

    const row = ev.target.closest("tr[data-id]");
    if (row) {
      const id = row.getAttribute("data-id");
      openModal("edit", findExpenseById(id));
    }
  });

  try {
    await refreshAll();
  } catch (e) {
    document.getElementById("expensesTbody").innerHTML =
      `<tr><td colspan="6" class="text-danger">Failed to load. ${escapeHtml(e.message || "")}</td></tr>`;
  }
});

