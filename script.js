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
    const nextStep = document.getElementById(`step-${stepNumber}`);
    if (nextStep) {
        nextStep.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTab(tabName, event) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const nextTab = document.getElementById(`${tabName}-tab`);
    if(nextTab) {
        nextTab.classList.add('active');
    }
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// --- API Fetching & Display ---
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
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch products.');

        displayOpportunities(data.products);
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        displayOpportunities(getDemoOpportunities()); // Fallback to demo data
    } finally {
        loading.style.display = 'none';
    }
}

function displayOpportunities(products) {
    const resultsContainer = document.getElementById('results-container');
    if (!products || products.length === 0) {
        resultsContainer.innerHTML = '<p>No products found for this niche. Try another one!</p>';
        return;
    }
    resultsContainer.innerHTML = products.map((p, index) => `
        <div class="result-card" id="product-${index}" onclick="toggleProductSelection(event, '${p.name}')">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
        </div>
    `).join('');
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
            body: JSON.stringify({ niche: nicheKeywords, products: selectedProducts, businessType: selectedBusinessType })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        displayKeywords(data.keywords);
    } catch (error) {
        console.error("Error fetching keywords:", error);
        displayKeywords(getDemoKeywords()); // Fallback
    } finally {
        loading.style.display = 'none';
    }
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
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        displayFullStrategy(data.content);
    } catch (error) {
        console.error("Error generating strategy:", error);
        displayFullStrategy(getDemoStrategy()); // Fallback
    } finally {
        loading.style.display = 'none';
        strategyContainer.style.display = 'block';
    }
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


// --- Helpers & State Management ---
function toggleProductSelection(event, name) {
    const card = event.currentTarget;
    const isSelected = card.classList.toggle('selected');
    
    if (isSelected) {
        selectedProducts.push({ name });
    } else {
        selectedProducts = selectedProducts.filter(p => p.name !== name);
    }
    
    // Limit selection to 5
    if (selectedProducts.length > 5) {
        card.classList.remove('selected');
        selectedProducts = selectedProducts.filter(p => p.name !== name);
        alert('You can select a maximum of 5 products.');
        return;
    }

    document.getElementById('proceed-btn').disabled = selectedProducts.length === 0;
}

function escapeQuotes(str) {
    return str ? str.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
}

// --- Demo Data Fallbacks ---
function getDemoOpportunities() {
    return [
        { name: `Demo ${nicheKeywords} Product 1`, description: "A high-quality demonstration product." },
        { name: `Demo ${nicheKeywords} Product 2`, description: "An affordable demonstration option." },
        { name: `Demo ${nicheKeywords} Product 3`, description: "The most popular demonstration choice." }
    ];
}

function getDemoKeywords() {
    return {
        primary: [{ keyword: `best ${nicheKeywords}`, volume: '12,100' }, { keyword: `${nicheKeywords} reviews`, volume: '8,100' }],
        longTail: [{ keyword: `how to choose ${nicheKeywords}` }, { keyword: `cheap ${nicheKeywords} under $50` }]
    };
}

function getDemoStrategy() {
    return {
        articles: [
            { title: `The Ultimate Guide to ${nicheKeywords} in 2025`, description: "This is a sample article outline about the best products and tips for your chosen niche." },
            { title: `5 Common ${nicheKeywords} Mistakes and How to Avoid Them`, description: "A helpful article to build trust with your audience." }
        ],
        social: [
            { platform: "Facebook", post: `Thinking about getting into ${nicheKeywords}? Here are 3 things you absolutely need to know first! #_yourniche_ #tips` },
            { platform: "Instagram", post: `Loving my new ${nicheKeywords} setup! ✨ It makes all the difference. What are your must-have items? #_yourniche_ #essentials` }
        ]
    };
}
