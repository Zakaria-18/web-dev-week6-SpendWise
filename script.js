const APP_NAME   = "SpendWise";
const CATEGORIES = ["Food", "Transport", "Rent", "Entertainment", "Savings", "Utilities", "Other"];

const MONTHLY_BUDGET = 2000;

let expenses = [
  { id: 1, name: "Weekly groceries", amount: 85.40, category: "Food",          date: "2026-09-18" },
  { id: 2, name: "Matatu fare",      amount: 12.00, category: "Transport",     date: "2026-09-19" },
  { id: 3, name: "Monthly rent",     amount: 650.00, category: "Rent",         date: "2026-09-01" },
  { id: 4, name: "Cinema tickets",   amount: 24.50, category: "Entertainment", date: "2026-09-20" },
  { id: 5, name: "Phone data",       amount: 15.00, category: "Other",         date: "2026-09-21" },
];

let nextId = 6;


const form         = document.getElementById("expense-form");
const nameInput    = document.getElementById("expense-name");
const amountInput  = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const dateInput    = document.getElementById("expense-date");

const balanceValue = document.getElementById("balance-value");
const cardGrid     = document.getElementById("card-grid");
const emptyState   = document.getElementById("empty-state");
const tableBody    = document.getElementById("expenses-body");
const tableEmpty   = document.getElementById("table-empty");

function calculateTotalSpent(list) {
  let total = 0;
  for (const expense of list) {
    total = total + expense.amount;
  }
  return total;
}


 */
function calculateCategoryTotals(list) {
  const totals = {};
  for (const expense of list) {
    if (totals[expense.category] === undefined) {
      totals[expense.category] = 0;
    }
    totals[expense.category] = totals[expense.category] + expense.amount;
  }
  return totals;
}


function calculateBalance(budget, spent) {
  return budget - spent;
}

function formatCurrency(value) {
  return "$" + value.toFixed(2);
}

 */
function renderBalance() {
  const totalSpent     = calculateTotalSpent(expenses);
  const remainingMoney = calculateBalance(MONTHLY_BUDGET, totalSpent);

  balanceValue.textContent = formatCurrency(remainingMoney);

  if (remainingMoney < 0) {
    balanceValue.style.color = "var(--negative-fg)";
  } else if (remainingMoney === 0) {
    balanceValue.style.color = "var(--text-secondary)";
  } else {
    balanceValue.style.color = "var(--text-primary)";
  }
}

function renderCards() {
  const totals = calculateCategoryTotals(expenses);
  const keys   = Object.keys(totals);

  if (keys.length === 0) {
    emptyState.style.display = "flex";
    cardGrid.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";

  let maxTotal = 0;
  for (const key of keys) {
    if (totals[key] > maxTotal) {
      maxTotal = totals[key];
    }
  }

  let html = "";
  for (const category of keys) {
    const amount    = totals[category];
    const percentage = Math.round((amount / maxTotal) * 100);

    html += `
      <article class="card" tabindex="0" aria-label="${category}: ${formatCurrency(amount)}">
        <div class="card-header">
          <div class="card-icon" aria-hidden="true">${iconFor(category)}</div>
        </div>
        <div class="card-body">
          <p class="card-label">${category}</p>
          <p class="card-amount">${formatCurrency(amount)}</p>
          <p class="card-meta">${countFor(category)} ${countFor(category) === 1 ? "entry" : "entries"}</p>
        </div>
        <div class="card-bar"><div class="card-bar-fill" style="width: ${percentage}%;"></div></div>
      </article>
    `;
  }

  cardGrid.innerHTML = html;
}

function renderTable() {
  if (expenses.length === 0) {
    tableBody.innerHTML = "";
    tableEmpty.style.display = "block";
    return;
  }

  tableEmpty.style.display = "none";

  let rows = "";
  for (const expense of expenses) {
    rows += `
      <tr>
        <td>${escapeHtml(expense.name)}</td>
        <td class="amount">${formatCurrency(expense.amount)}</td>
        <td><span class="category-tag">${expense.category}</span></td>
        <td>${expense.date}</td>
        <td class="col-actions">
          <button type="button" class="btn-delete" data-id="${expense.id}" aria-label="Delete ${escapeHtml(expense.name)}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }
  tableBody.innerHTML = rows;
}

function renderDashboard() {
  renderBalance();
  renderCards();
  renderTable();
}


function countFor(category) {
  let count = 0;
  for (const expense of expenses) {
    if (expense.category === category) {
      count = count + 1;
    }
  }
  return count;
}

function iconFor(category) {
  const icons = {
    Food:          '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v8a3 3 0 0 0 3 3v7"/><path d="M5 3v4M8 3v4M11 3v8a3 3 0 0 1-3 3"/><path d="M17 3c-1.5 2-2 4-2 6s.5 3 2 4v8"/></svg>',
    Transport:     '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 11h18"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
    Rent:          '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M10 21v-6h4v6"/></svg>',
    Entertainment: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></svg>',
    Savings:       '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 6.5c0-1.9-2.24-3-5-3s-5 1.1-5 3 1.5 2.6 5 3 5 1.4 5 3-2.24 3-5 3-5-1.1-5-3"/></svg>',
    Utilities:     '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/></svg>',
    Other:         '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none"/></svg>',
  };
  return icons[category] || icons.Other;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function handleAddExpense(event) {
  event.preventDefault();   

  const name     = nameInput.value.trim();
  const amount   = Number(amountInput.value);
  const category = categoryInput.value;
  const date     = dateInput.value;

  if (name === "") {
    alert("Please enter an expense name.");
    nameInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0.");
    amountInput.focus();
    return;
  }

  if (date === "") {
    alert("Please pick a date.");
    dateInput.focus();
    return;
  }

  const newExpense = {
    id: nextId,
    name: name,
    amount: amount,
    category: category,
    date: date,
  };
  nextId = nextId + 1;

  expenses.push(newExpense);

  form.reset();

  renderDashboard();

  console.log("[" + APP_NAME + "] Added expense:", newExpense);
}

function handleTableClick(event) {
  const button = event.target.closest(".btn-delete");
  if (!button) return;  

  const id = Number(button.dataset.id);

  if (!confirm("Delete this expense?")) return;

  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });

  renderDashboard();

  console.log("[" + APP_NAME + "] Removed expense with id", id);
}


form.addEventListener("submit", handleAddExpense);
tableBody.addEventListener("click", handleTableClick);

dateInput.value = new Date().toISOString().slice(0, 10);

renderDashboard();

console.log("[" + APP_NAME + "] Ready. " + expenses.length + " expenses loaded.");
