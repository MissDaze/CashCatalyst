let currentStep = 1;
let selectedBusinessType = '';
let nicheKeywords = '';
let selectedProducts = [];

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.step').forEach((el, idx) => {
    el.style.display = idx === step - 1 ? 'block' : 'none';
  });
}

// Step 1 → 2
function goToStep2() {
  const nicheInput = document.getElementById('nicheInput');
  if (nicheInput.value.trim().length < 3) {
    alert('Please enter a valid niche (min 3 characters).');
    return;
  }
  nicheKeywords = nicheInput.value.trim();
  showStep(2);
}

// Step 2 → 3
function selectBusinessType(type, event) {
  selectedBusinessType = type;
  document.querySelectorAll('.business-card').forEach(card =>
    card.classList.remove('selected')
  );
  event.currentTarget.classList.add('selected');
  showStep(3);
  fetchOpportunities();
}

// Step 3 → 4
function proceedToKeywords() {
  if (selectedProducts.length === 0) {
    alert('Select at least one opportunity.');
    return;
  }
  showStep(4);
  fetchKeywords();
}

// Step 4 → 5
function showMarketingStrategy() {
  showStep(5);
  generateMarketingContent();
}

// Fetch from your backend
async function fetchOpportunities() {
  try {
    const res = await fetch('/.netlify/functions/analyze-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: nicheKeywords })
    });

    const data = await res.json();
    displayOpportunities(data.keywords || []);
  } catch (err) {
    alert('Failed to fetch keyword suggestions.');
    console.error(err);
  }
}

function displayOpportunities(opportunities) {
  const container = document.getElementById('opportunity-list');
  container.innerHTML = '';
  opportunities.forEach(item => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `<h4>${item}</h4>`;
    card.addEventListener('click', () => toggleOpportunity(item, card));
    container.appendChild(card);
  });
}

function toggleOpportunity(name, cardElement) {
  const index = selectedProducts.indexOf(name);
  if (index > -1) {
    selectedProducts.splice(index, 1);
    cardElement.classList.remove('selected');
  } else {
    selectedProducts.push(name);
    cardElement.classList.add('selected');
  }
}

async function fetchKeywords() {
  try {
    const res = await fetch('/.netlify/functions/analyze-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: nicheKeywords })
    });
    const data = await res.json();
    document.getElementById('keywords-output').innerText =
      data.keywords?.join(', ') || 'No keywords found.';
  } catch (err) {
    document.getElementById('keywords-output').innerText = 'Error fetching keywords.';
    console.error(err);
  }
}

async function generateMarketingContent() {
  try {
    const res = await fetch('/.netlify/functions/marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: nicheKeywords,
        products: selectedProducts
      })
    });

    const data = await res.json();
    const container = document.getElementById('marketing-output');
    container.innerText = data.marketing || 'No content generated.';

    await generateCalendar(); // <-- trigger calendar after content
  } catch (err) {
    document.getElementById('marketing-output').innerText = 'Failed to generate content.';
    console.error(err);
  }
}

async function generateCalendar() {
  try {
    const res = await fetch('/.netlify/functions/marketing-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: nicheKeywords,
        products: selectedProducts,
        tone: 'conversion-focused'
      })
    });

    const data = await res.json();
    const parsed = JSON.parse(data.calendar); // Gemini returns text
    renderCalendar(parsed);
  } catch (error) {
    document.getElementById('marketing-output').innerText +=
      '\n\n⚠️ Error creating campaign calendar.';
    console.error('Calendar error:', error);
  }
}

function renderCalendar(days) {
  const container = document.getElementById('marketing-output');
  container.innerHTML += `<h3>📅 30-Day Campaign Calendar</h3>`;
  const list = document.createElement('ul');

  days.forEach(day => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>Day ${day.day}:</strong> ${day.action} <em>(${day.channel})</em> – ${day.budget}<br/><small>${day.notes}</small>`;
    list.appendChild(item);
  });

  container.appendChild(list);
}
