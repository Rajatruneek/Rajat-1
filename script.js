const form = document.getElementById('customerForm');
const entriesTable = document.getElementById('entriesTable');
const sendWhatsApp = document.getElementById('sendWhatsApp');
const exportCsv = document.getElementById('exportCsv');
const exportWord = document.getElementById('exportWord');
const clearEntries = document.getElementById('clearEntries');
const STORAGE_KEY = 'crmCustomerEntries';

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderEntries() {
  const entries = getEntries();
  entriesTable.innerHTML = entries.map(entry => `
    <tr>
      <td>${entry.name}</td>
      <td>${entry.phone}</td>
      <td>${entry.email}</td>
      <td>${entry.company}</td>
      <td>${entry.message}</td>
    </tr>
  `).join('');
}

function createCsv(entries) {
  const header = ['Name', 'Phone', 'Email', 'Company', 'Notes'];
  const rows = entries.map(entry => [entry.name, entry.phone, entry.email, entry.company, entry.message]);
  const csv = [header, ...rows]
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  return csv;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const entry = {
    name: data.get('name').trim(),
    phone: data.get('phone').trim(),
    email: data.get('email').trim(),
    company: data.get('company').trim(),
    message: data.get('message').trim(),
    savedAt: new Date().toISOString(),
  };

  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  renderEntries();
  form.reset();
  alert('Customer entry saved locally.');
});

sendWhatsApp.addEventListener('click', () => {
  const data = new FormData(form);
  const name = data.get('name').trim();
  const phone = data.get('phone').trim();
  const company = data.get('company').trim();
  const email = data.get('email').trim();
  const message = data.get('message').trim();

  if (!phone) {
    alert('Please enter a phone number first.');
    return;
  }

  const text = `Customer details:\nName: ${name || '-'}\nPhone: ${phone}\nEmail: ${email || '-'}\nCompany: ${company || '-'}\nNotes: ${message || '-'} `;
  const encoded = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encoded}`;
  window.open(whatsappUrl, '_blank');
});

exportCsv.addEventListener('click', () => {
  const entries = getEntries();
  if (!entries.length) {
    alert('No entries saved yet.');
    return;
  }
  downloadFile('crm-entries.csv', createCsv(entries), 'text/csv;charset=utf-8;');
});

exportWord.addEventListener('click', () => {
  const entries = getEntries();
  if (!entries.length) {
    alert('No entries saved yet.');
    return;
  }

  const content = entries.map(entry => `Name: ${entry.name}\nPhone: ${entry.phone}\nEmail: ${entry.email}\nCompany: ${entry.company}\nNotes: ${entry.message}\n---\n`).join('\n');
  downloadFile('crm-entries.doc', content, 'application/msword');
});

clearEntries.addEventListener('click', () => {
  if (confirm('Clear all saved entries?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderEntries();
  }
});

renderEntries();
