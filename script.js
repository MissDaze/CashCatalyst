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
    fetchKeywords();
}

function showMarketingStrategy() {
    showStep(5);
    generateMarketingContent();
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

// --- API Fetching with Error Display ---
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
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        displayOpportunities(data.products);
    } catch (error) {
        alert(`A critical error occurred: ${error.message}`);
        resultsContainer.innerHTML = '<p>Could not fetch real data. Please try another niche or check your API keys.</p>'
    } finally {
        loading.style.display = 'none';
    }
}

async function fetchKeywords() {
    const keywordContainer = document.getElementById('keyword-analysis');
    const loading = document.getElementById('loading-keywords');
    loading.style.display = 'block';
    keywordContainer.innerHTML = '';

    try {
        const response = await fetch(`${apiEndpoint}/analyze-keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ niche: nicheKeywords, products: selectedProducts })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        const data = await response.json();
        displayKeywords(data.keywords);
    } catch (error) {
        alert(`An error occurred while fetching keywords: ${error.message}`);
    } finally {
        loading.style.display = 'none';
    }
}

async function generateMarketingContent() {
    const strategyContainer = document.getElementById('strategy-container');
    const loading = document.getElementById('loading-strategy');
    loading.style.display = 'block';
    strategyContainer.style.display = 'none';

    try {
        const response = await fetch(`${apiEndpoint}/generate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ niche: nicheKeywords, products: selectedProducts, businessType: selectedBusinessType })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        const data = await response.json();
        displayFullStrategy(data.content);
    } catch (error) {
        alert(`An error occurred while generating content: ${error.message}`);
    } finally {
        loading.style.display = 'none';
        strategyContainer.style.display = 'block';
    }
}

// --- Display Functions ---
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
        <div class="content-item">
            <h4>Long-Tail Opportunities</h4>
            <ul>${keywords.longTail.map(kw => `<li>${kw.keyword}</li>`).join('')}</ul>
        </div>
    `;
}

function displayFullStrategy(content) {
    const strategyContainer = document.getElementById('strategy-container');
    strategyContainer.innerHTML = `
        <div class="strategy-tabs">
            <button class="tab-btn active" onclick="showTab('content', event)"><i class="fas fa-edit"></i> Content</button>
            <button class="tab-btn" onclick="showTab('social', event)"><i class="fas fa-share-alt"></i> Social</button>
        </div>
        <div class="tab-content">
            <div class="tab-pane active" id="content-tab">
                <div class="content-section" id="articles-section">
                    ${content.articles.map(a => `<div class="content-item"><h4>${a.title}</h4><p>${a.description}</p></div>`).join('')}
                </div>
            </div>
            <div class="tab-pane" id="social-tab">
                <div class="content-section" id="social-posts-section">
                     ${content.social.map(p => `<div class="content-item"><h4>${p.platform} Post</h4><p>${p.post}</p></div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// --- Helpers ---
function toggleProductSelection(event, name) {
    const card = event.currentTarget;
    const isSelected = card.classList.toggle('selected');
    if (isSelected) {
        if (selectedProducts.length < 5) {
            selectedProducts.push({ name });
        } else {
            card.classList.remove('selected');
            alert('You can select a maximum of 5 products.');
        }
    } else {
        selectedProducts = selectedProducts.filter(p => p.name !== name);
    }
    document.getElementById('proceed-btn').disabled = selectedProducts.length === 0;
}
function escapeQuotes(str) {
    return str ? str.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
