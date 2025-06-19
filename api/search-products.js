import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { niche, businessType } = req.body;
        const apiKey = process.env.SERPAPI_API_KEY;

        if (!apiKey) {
            throw new Error("The SERPAPI_API_KEY environment variable is missing or incorrect.");
        }

        const params = {
            api_key: apiKey,
            q: `${niche} for ${businessType === 'affiliate' ? 'review' : 'sale'}`,
            engine: 'google',
            gl: 'us',
            hl: 'en',
        };

        if (businessType === 'dropshipping') {
            params.tbm = 'shop';
        }

        const response = await axios.get('https://serpapi.com/search', { params });
        
        const resultsList = response.data.shopping_results || response.data.organic_results;
        let products = [];

        if (resultsList && resultsList.length > 0) {
            products = resultsList.slice(0, 10).map(item => ({
                name: item.title,
                description: item.snippet || `Source: ${item.source || 'Online Store'}`
            }));
        }

        return res.status(200).json({ success: true, products: products });

    } catch (error) {
        console.error('Error in /api/search-products:', error.message);
        // THIS IS THE IMPORTANT CHANGE: We are now sending the real error message back.
        return res.status(500).json({ success: false, error: error.message });
    }
}
