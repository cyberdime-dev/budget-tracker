let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const transactionList = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const form = document.getElementById('transaction-form');
const description = document.getElementById('description');
const amount = document.getElementById('amount');
const date = document.getElementById('date');
const incomeCategory = document.getElementById('income-category');
const expenseCategory = document.getElementById('expense-category');

// Category display mapping
const categoryMap = {
  // Income categories
  'salary': '💰 Salary',
  'freelance': '💼 Freelance',
  'investment': '📈 Investment',
  'business': '🏢 Business',
  'gift': '🎁 Gift',
  'refund': '↩️ Refund',
  'other-income': '📦 Other Income',
  
  // Expense categories
  'food': '🍔 Food',
  'transport': '🚗 Transport',
  'entertainment': '🎬 Entertainment',
  'shopping': '🛍️ Shopping',
  'bills': '💡 Bills',
  'healthcare': '🏥 Healthcare',
  'education': '📚 Education',
  'travel': '✈️ Travel',
  'housing': '🏠 Housing',
  'other-expense': '📦 Other Expense'
};

function getCategoryDisplay(categoryValue) {
  return categoryMap[categoryValue] || '📦 Other';
}

// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to ensure all transactions have timestamps (for backward compatibility)
function ensureTimestamps() {
  transactions.forEach(transaction => {
    if (!transaction.timestamp) {
      // If no timestamp exists, create one based on the date
      const transactionDate = new Date(transaction.date);
      transaction.timestamp = transactionDate.toISOString();
    }
  });
}

// Function to format date for display
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to compare only dates
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

// Function to toggle category dropdowns based on amount
function toggleCategoryDropdowns() {
  const amountValue = parseFloat(amount.value);
  
  if (amountValue > 0) {
    // Show income dropdown, hide expense dropdown
    incomeCategory.style.display = 'block';
    expenseCategory.style.display = 'none';
    expenseCategory.value = ''; // Clear expense selection
  } else if (amountValue < 0) {
    // Show expense dropdown, hide income dropdown
    expenseCategory.style.display = 'block';
    incomeCategory.style.display = 'none';
    incomeCategory.value = ''; // Clear income selection
  } else {
    // Hide both dropdowns if amount is 0 or empty
    incomeCategory.style.display = 'none';
    expenseCategory.style.display = 'none';
    incomeCategory.value = '';
    expenseCategory.value = '';
  }
}

// Add event listener to amount input
amount.addEventListener('input', toggleCategoryDropdowns);

function updateDOM() {
  transactionList.innerHTML = '';

  transactions.forEach((trans, index) => {
    const sign = trans.amount < 0 ? '-' : '+';
    const li = document.createElement('li');
    li.classList.add(trans.amount < 0 ? 'expense' : 'income');
    
    // Get category display text with emoji
    const categoryDisplay = getCategoryDisplay(trans.category);
    const formattedDate = formatDateForDisplay(trans.date);
    
    li.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-main">
          <span class="category-badge">${categoryDisplay}</span>
          <span class="description">${trans.description}</span>
        </div>
        <div class="transaction-details">
          <div class="transaction-date">${formattedDate}</div>
          <div class="transaction-amount">${sign}$${Math.abs(trans.amount).toFixed(2)}</div>
        </div>
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

  const amountValue = parseFloat(amount.value);
  let selectedCategory = '';
  
  // Determine which category is selected based on amount
  if (amountValue > 0) {
    selectedCategory = incomeCategory.value;
  } else if (amountValue < 0) {
    selectedCategory = expenseCategory.value;
  }

  if (description.value.trim() === '' || amount.value.trim() === '' || date.value === '' || selectedCategory === '') return;

  transactions.push({
    description: description.value,
    amount: +amount.value,
    date: date.value,
    timestamp: new Date().toISOString(),
    category: selectedCategory
  });

  description.value = '';
  amount.value = '';
  date.value = getCurrentDate();
  incomeCategory.value = '';
  expenseCategory.value = '';
  incomeCategory.style.display = 'none';
  expenseCategory.style.display = 'none';
  updateDOM();
});

function removeTransaction(index) {
  transactions.splice(index, 1);
  updateDOM();
}

// Ensure all existing transactions have timestamps
ensureTimestamps();

// Initialize date field with today's date
date.value = getCurrentDate();

updateDOM();
