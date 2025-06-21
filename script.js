// script.js

let currentStep = 1;
let selectedBusinessType = '';
let nicheKeywords = '';
let selectedProducts = [];

const apiEndpoint = '/api';

// Step 1 → 2: Validate niche input
function goToStep2() {
  const nicheInput = document.getElementById('niche-input');
  if (nicheInput.value.trim().length < 3) {
    alert('Please enter a valid niche (at least 3 characters).');
    return;
  }
  nicheKeywords = nicheInput.value.trim();
  showStep(2);
}

// Step 2: Choose business type & fetch opportunities
function selectBusinessType(type, event) {
  selectedBusinessType = type;
  document.querySelectorAll('.business-card').forEach(card =>
    card.classList.remove('selected')
  );
  event.currentTarget.classList.add('selected');
  showStep(3);
  fetchOpportunities();
}

// Step 3 → 4: Proceed to fetch keywords
function proceedToKeywords() {
  if (selectedProducts.length === 0) {
    alert('Please select at least one opportunity.');
    return;
  }
  showStep(4);
  fetchKeywords();
}

// Step 4 → 5: Final marketing strategy
function showMarketingStrategy() {
  showStep(5);
  generateMarketingContent();
}

// Reusable: Change visible step
function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.step').forEach((el, idx) => {
    el.style.display = idx === step - 1 ? 'block' : 'none';
  });
}

// Fetch ideas based on selected niche and business type
async function fetchOpportunities() {
  try {
    const res = await fetch(`${apiEndpoint}/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: nicheKeywords, type: selectedBusinessType })
    });
    const data = await res.json();
    displayOpportunities(data.opportunities || []);
  } catch (err) {
    alert('Failed to fetch opportunities. Try again.');
  }
}

// Render opportunity cards
function displayOpportunities(opportunities) {
  const container = document.getElementById('opportunity-list');
  container.innerHTML = '';
  opportunities.forEach(item => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `<h4>${item.name}</h4><p>${item.description}</p>`;
    card.addEventListener('click', () => toggleOpportunity(item.name, card));
    container.appendChild(card);
  });
}

// Toggle selection
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

// Fetch keywords
async function fetchKeywords() {
  try {
    const res = await fetch(`${apiEndpoint}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: selectedProducts, niche: nicheKeywords })
    });
    const data = await res.json();
    document.getElementById('keywords-output').innerText = data.keywords || 'No keywords found.';
  } catch (err) {
    document.getElementById('keywords-output').innerText = 'Error fetching keywords.';
  }
}

// Generate marketing pitch
async function generateMarketingContent() {
  try {
    const res = await fetch(`${apiEndpoint}/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: selectedProducts, niche: nicheKeywords })
    });
    const data = await res.json();
    document.getElementById('marketing-output').innerText = data.marketing || 'No content available.';
  } catch (err) {
    document.getElementById('marketing-output').innerText = 'Failed to generate content.';
  }
}
