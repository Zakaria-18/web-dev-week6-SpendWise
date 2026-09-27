# SpendWise — Interactive Budget Tracker

SpendWise is a personal budget and expense tracker built progressively over
the course. This week the app becomes **interactive**: users can add
expenses through a form, delete them from a table, and watch the dashboard
update live.

## Files

- `index.html` — dashboard shell + Add Expense form + expenses table
- `style.css` — layout, theme, responsive rules, micro-interactions
- `script.js` — all JavaScript: data, calculations, DOM rendering, events
- `README.md` — this file

## What was built this week

### 1. Add Expense form

A proper `<form>` with four fields (name, amount, category, date) and a
submit button. Wrapped in a card and styled to match the rest of the
dashboard. On mobile it collapses to a single column.

### 2. Live expense table

Every expense is now rendered as a table row with a **delete button**. The
table updates the moment an expense is added or removed — no page reload.

### 3. Dynamic category cards

The category cards are no longer hardcoded. They are generated from the
`expenses` array, grouped by category, with a proportional progress bar
showing each category's share of the largest total.

### 4. Live balance chip

The "Remaining" chip in the header updates after every change. It shows a
green number when you're within budget, a neutral color when you've spent
exactly your budget, and red when you're over.

### 5. Empty states

If there are no expenses, the category grid shows a friendly empty state
and the table shows a "no expenses recorded" message. As soon as the first
expense is added, both swap to the real content.

## JavaScript concepts implemented

### Conditionals

Conditionals appear throughout `script.js` and drive most of the app's
behavior. A few key examples:

**Input validation** — bail out of `handleAddExpense` if any field is
invalid:

```js
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
```

**Balance color** — swap the chip color depending on the balance:

```js
if (remainingMoney < 0) {
  balanceValue.style.color = "var(--negative-fg)";
} else if (remainingMoney === 0) {
  balanceValue.style.color = "var(--text-secondary)";
} else {
  balanceValue.style.color = "var(--text-primary)";
}
```

**Empty states** — show the empty panel or the cards, never both:

```js
if (keys.length === 0) {
  emptyState.style.display = "flex";
  cardGrid.innerHTML = "";
  return;
}
emptyState.style.display = "none";
```

### Arrays

The `expenses` array is the **single source of truth** for the whole
application. Every expense is an object inside it:

```js
let expenses = [
  { id: 1, name: "Weekly groceries", amount: 85.40, category: "Food",          date: "2026-09-18" },
  { id: 2, name: "Matatu fare",      amount: 12.00, category: "Transport",     date: "2026-09-19" },
  { id: 3, name: "Monthly rent",     amount: 650.00, category: "Rent",         date: "2026-09-01" },
  // ...
];
```

Adding a record:

```js
expenses.push({
  id: nextId,
  name: name,
  amount: amount,
  category: category,
  date: date,
});
```

Removing a record:

```js
expenses = expenses.filter(expense => expense.id !== id);
```

Every render function reads from this array. Nothing is stored anywhere
else, so there's no risk of the UI drifting out of sync with the data.

### Loops

Loops are used to sum totals, group by category, and build the DOM:

**Summing totals:**

```js
function calculateTotalSpent(list) {
  let total = 0;
  for (const expense of list) {
    total = total + expense.amount;
  }
  return total;
}
```

**Grouping by category:**

```js
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
```

**Building table rows:**

```js
let rows = "";
for (const expense of expenses) {
  rows += `<tr>...</tr>`;
}
tableBody.innerHTML = rows;
```

## How the DOM is updated

Every render function writes to a specific part of the page. They're all
called by `renderDashboard()`, which runs once on load and again after
every change:

```js
function renderDashboard() {
  renderBalance();
  renderCards();
  renderTable();
}
```

- `renderBalance()` — sets `balanceValue.textContent` and its color
- `renderCards()` — rebuilds `cardGrid.innerHTML` from category totals
- `renderTable()` — rebuilds `tableBody.innerHTML` from the expenses array

This pattern — **read from data, write to DOM** — is what keeps the app
predictable. The DOM is never the source of truth; it's always a mirror of
the `expenses` array.

## How user interactions are handled

Two `addEventListener` calls wire the whole app:

```js
form.addEventListener("submit", handleAddExpense);
tableBody.addEventListener("click", handleTableClick);
```

**Form submission** — `handleAddExpense` reads the four input values,
validates them, pushes a new record into `expenses`, resets the form, and
calls `renderDashboard()`:

```js
function handleAddExpense(event) {
  event.preventDefault();   // stop the page reload
  // read input, validate, push, reset, render
}
```

**Delete buttons** — instead of attaching a listener to each button (which
would need to be re-attached after every render), a single listener on the
table body catches every click and inspects `event.target`:

```js
function handleTableClick(event) {
  const button = event.target.closest(".btn-delete");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (!confirm("Delete this expense?")) return;
  expenses = expenses.filter(expense => expense.id !== id);
  renderDashboard();
}
```

This is called **event delegation** and it's the standard pattern for
lists that change over time.

## Flow: user action → data → DOM

Every interaction follows the same three-step cycle:

1. **User action** — submit the form, click a delete button
2. **Data update** — push to or filter the `expenses` array
3. **DOM re-render** — `renderDashboard()` rebuilds the affected sections

Because the DOM is always rebuilt from the data, the UI can never get out
of sync. This is the same pattern React and Vue use internally — we're just
doing it by hand.

## Challenges and how they were resolved

**Challenge 1 — Event listeners lost on re-render.**
Attaching a `click` listener to each delete button worked on the first
render, but after adding a new expense the buttons were replaced by
`innerHTML` and the listeners were gone. *Resolved* by switching to event
delegation — one listener on the table body handles clicks for every
current and future button.

**Challenge 2 — Category totals need grouping.**
Summing all expenses was easy, but rendering per-category totals required
grouping. *Resolved* by building a plain object keyed by category name,
then iterating `Object.keys(totals)` to render one card per category.

**Challenge 3 — Making progress bars proportional.**
Initial bars all looked the same width. *Resolved* by finding the largest
category total first, then computing each bar as a percentage of that max:

```js
const percentage = Math.round((amount / maxTotal) * 100);
```

**Challenge 4 — XSS risk from user input.**
Injecting user-provided names directly into `innerHTML` would allow a
script tag to run if a user typed one. *Resolved* with a small
`escapeHtml` helper that replaces `<`, `>`, `&`, `"`, and `'` with their
HTML entities before insertion.

**Challenge 5 — Form validation edge cases.**
Empty names, zero amounts, negative amounts, and missing dates all needed
to be caught before pushing a record. *Resolved* with a series of early-
return conditionals in `handleAddExpense`, each focusing the offending
input so the user knows where to fix it.

## How to run it

1. Clone or download the repo
2. Open `index.html` in any modern browser
3. Try the following:
   - Add an expense with the form
   - Watch the balance chip, category cards, and table update
   - Delete a row with the trash icon
   - Try submitting invalid data to see the validation messages
   - Open DevTools → Console to see the log output

## How to verify the requirements

| Requirement | Where to look |
|-------------|---------------|
| Conditionals | `handleAddExpense`, `renderBalance`, `renderCards`, `handleTableClick` |
| Arrays | `expenses`, `expenses.push`, `expenses.filter` |
| Loops | `calculateTotalSpent`, `calculateCategoryTotals`, `renderTable`, `renderCards` |
| DOM manipulation | `renderBalance`, `renderCards`, `renderTable` |
| Event listeners | `form.addEventListener("submit", ...)`, `tableBody.addEventListener("click", ...)` |
| User action → data → DOM | `handleAddExpense` (form flow), `handleTableClick` (delete flow) |

## What's coming next

Week 8 will likely add: persistence (localStorage), editing existing
expenses, filtering by category, and exporting the data.

## Why no `var`

`var` is legacy. Modern JavaScript uses `const` by default and `let` only
when a value must be reassigned. This codebase follows that rule
consistently — `expenses` and `nextId` are `let` because they change;
everything else is `const`.
