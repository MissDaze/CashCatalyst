// Global variables
let currentStep = 1;
let selectedBusinessType = '';
let nicheKeywords = '';
let selectedProducts = [];
const apiEndpoint = '/api';

// --- Core Navigation ---
function goToStep2() {
    const nicheInput = document.getElementById('niche-input');
    if (nicheInput.value.trim().length < 3) {
        alert('Please enter a valid niche (at least 3 characters).');
        return;
    }
    nicheKeywords = nicheInput.value.trim();
    showStep(2);
}

function selectBusinessType(type, event) {
    selectedBusinessType = type;
    document.querySelectorAll('.business-card').forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    showStep(3);
    fetchOpportunities();
}

function proceedToKeywords() {
    if (selectedProducts.length === 0) {
        alert('Please select at least one opportunity.');
        return;
    }
    showStep(4);
    // In a real app, you would fetch keywords here.
    displayKeywords(getDemoKeywords());
}

function showMarketingStrategy() {
    showStep(5);
    // In a real app, you would generate marketing content here.
    displayFullStrategy(getDemoStrategy());
}

function showStep(stepNumber) {
    document.querySelectorAll('.step-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTab(tabName, event) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    event.currentTarget?.classList.add('active');
}

// --- API Fetching with Advanced Error Handling ---
async function fetchOpportunities() {
    const loading = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    loading.style.display = 'block';
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch(`${apiEndpoint}/search-products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ niche: nicheKeywords, businessType: selectedBusinessType })
        });

        // THIS IS THE IMPORTANT CHANGE: Check if the server responded with an error code
        if (!response.ok) {
            const errorData = await response.json();
            // This throws an error with the message from the backend
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        displayOpportunities(data.products);

    } catch (error) {
        console.error("Error fetching opportunities:", error);
        // The alert box will now show the REAL error message from the backend.
        alert(`A critical error occurred: ${error.message}`);
        displayOpportunities(getDemoOpportunities());
    } finally {
        loading.style.display = 'none';
    }
}


// --- Other Functions (unchanged but included for completeness) ---

function displayOpportunities(products) {
    const resultsContainer = document.getElementById('results-container');
    if (!products || products.length === 0) {
        resultsContainer.innerHTML = '<p>No products found for this niche. Try another one!</p>';
        return;
    }
    resultsContainer.innerHTML = products.map((p, index) => `
        <div class="result-card" id="product-${index}" onclick="toggleProductSelection(event, '${escapeQuotes(p.name)}')">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
        </div>
    `).join('');
}

function displayKeywords(keywords) {
    const keywordContainer = document.getElementById('keyword-analysis');
    keywordContainer.innerHTML = `
        <div class="content-item">
            <h4>Primary Keywords</h4>
            <ul>${keywords.primary.map(kw => `<li>${kw.keyword} (${kw.volume} searches/mo)</li>`).join('')}</ul>
        </div>
    `;
}

function displayFullStrategy(content) {
    const strategyContainer = document.getElementById('strategy-container');
    strategyContainer.innerHTML = `
        <div class="strategy-tabs">
            <button class="tab-btn active" onclick="showTab('content', event)"><i class="fas fa-edit"></i> Content</button>
        </div>
        <div class="tab-content">
            <div class="tab-pane active" id="content-tab">
                <div class="content-section" id="articles-section">
                    ${content.articles.map(a => `<div class="content-item"><h4>${a.title}</h4><p>${a.description}</p></div>`).join('')}
                </div>
            </div>
        </div>
    `;
    strategyContainer.style.display = 'block';
    document.getElementById('loading-strategy').style.display = 'none';
}

function toggleProductSelection(event, name) {
    const card = event.currentTarget;
    const isSelected = card.classList.toggle('selected');
    if (isSelected) { selectedProducts.push({ name }); }
    else { selectedProducts = selectedProducts.filter(p => p.name !== name); }
    document.getElementById('proceed-btn').disabled = selectedProducts.length === 0;
}

function getDemoOpportunities() {
    return [{ name: `Demo ${nicheKeywords} Product`, description: "This is demo data." }];
}
function getDemoKeywords() {
    return { primary: [{ keyword: `best ${nicheKeywords}`, volume: '12,100' }] };
}
function getDemoStrategy() {
    return { articles: [{ title: `Guide to ${nicheKeywords}`, description: "This is a demo article idea." }] };
}
function escapeQuotes(str) {
    return str ? str.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
}
