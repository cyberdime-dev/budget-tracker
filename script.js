let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const transactionList = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const form = document.getElementById('transaction-form');
const description = document.getElementById('description');
const amount = document.getElementById('amount');
const category = document.getElementById('category');

// Category display mapping
const categoryMap = {
  'food': '🍔 Food',
  'transport': '🚗 Transport',
  'entertainment': '🎬 Entertainment',
  'shopping': '🛍️ Shopping',
  'bills': '💡 Bills',
  'healthcare': '🏥 Healthcare',
  'education': '📚 Education',
  'travel': '✈️ Travel',
  'income': '💰 Income',
  'other': '📦 Other'
};

function getCategoryDisplay(categoryValue) {
  return categoryMap[categoryValue] || '📦 Other';
}

function updateDOM() {
  transactionList.innerHTML = '';

  transactions.forEach((trans, index) => {
    const sign = trans.amount < 0 ? '-' : '+';
    const li = document.createElement('li');
    li.classList.add(trans.amount < 0 ? 'expense' : 'income');
    
    // Get category display text with emoji
    const categoryDisplay = getCategoryDisplay(trans.category);
    
    li.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-main">
          <span class="category-badge">${categoryDisplay}</span>
          <span class="description">${trans.description}</span>
        </div>
        <div class="transaction-amount">${sign}$${Math.abs(trans.amount).toFixed(2)}</div>
      </div>
      <button onclick="removeTransaction(${index})">x</button>
    `;
    transactionList.appendChild(li);
  });

  updateSummary();
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateSummary() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = amounts.filter(val => val > 0).reduce((acc, val) => acc + val, 0).toFixed(2);
  const expense = amounts.filter(val => val < 0).reduce((acc, val) => acc + val, 0).toFixed(2);

  balanceEl.textContent = `$${total}`;
  incomeEl.textContent = `+$${income}`;
  expensesEl.textContent = `-$${Math.abs(expense)}`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (description.value.trim() === '' || amount.value.trim() === '' || category.value === '') return;

  transactions.push({
    description: description.value,
    amount: +amount.value,
    category: category.value
  });

  description.value = '';
  amount.value = '';
  category.value = '';
  updateDOM();
});

function removeTransaction(index) {
  transactions.splice(index, 1);
  updateDOM();
}

updateDOM();
