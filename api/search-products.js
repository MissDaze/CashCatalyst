import axios from 'axios';

/**
 * API for searching products based on a niche.
 * This version makes a real API call to SerpApi to get Google search results.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { niche, businessType } = req.body;
        const apiKey = process.env.SERPAPI_API_KEY;

        // --- Validation ---
        if (!niche || !businessType) {
            return res.status(400).json({ success: false, error: 'Niche and businessType are required.' });
        }
        if (!apiKey) {
            // This error is for your benefit, to know if the key is missing on Vercel
            throw new Error("SERPAPI_API_KEY is not configured in environment variables.");
        }

        console.log(`[API] Making REAL search for niche: "${niche}", type: "${businessType}"`);

        // --- Build the API Request ---
        const params = {
            api_key: apiKey,
            q: `${niche} for ${businessType === 'affiliate' ? 'review' : 'sale'}`,
            engine: 'google',
            gl: 'us', // Geographic location: us = United States
            hl: 'en', // Host language: en = English
        };

        // If dropshipping, let's search the "Shopping" tab on Google
        if (businessType === 'dropshipping') {
            params.tbm = 'shop';
        }

        // --- Make the API Call ---
        const response = await axios.get('https://serpapi.com/search', { params });
        
        // --- Process the Results ---
        let products = [];
        // Check if we got shopping results or regular organic results
        const resultsList = response.data.shopping_results || response.data.organic_results;

        if (resultsList && resultsList.length > 0) {
            products = resultsList.slice(0, 10).map(item => ({
                name: item.title,
                // Use snippet for organic results, or a default text for shopping results
                description: item.snippet || `Source: ${item.source || 'Online Store'}`
            }));
        } else {
            // Handle cases where no results are found
            products.push({
                name: "No specific products found",
                description: `Try searching for a different or more popular niche than "${niche}".`
            })
        }

        return res.status(200).json({ success: true, products: products });

    } catch (error) {
        console.error('Error in /api/search-products:', error.message);
        // Send back a user-friendly error
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch real-time data.',
            // For debugging, send back the error message
            details: error.message 
        });
    }
}
