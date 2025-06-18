/**
 * API for analyzing keywords for a given niche.
 * In a real application, this would call external APIs like SerpApi or SEMrush.
 * For now, it returns realistic mock data.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { niche, products } = req.body;

        if (!niche || !products) {
            return res.status(400).json({ success: false, error: 'Niche and products are required.' });
        }

        console.log(`[API] Analyzing keywords for niche: "${niche}"`);

        // Simulate an API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- REAL LOGIC WOULD GO HERE ---
        // Example: const keywords = await callSerpApi(niche);

        const mockData = {
            primary: [
                { keyword: `best ${niche}`, volume: '22,200' },
                { keyword: `${niche} reviews`, volume: '9,900' },
                { keyword: `cheap ${niche}`, volume: '5,400' }
            ],
            longTail: [
                { keyword: `how to use ${niche} for beginners` },
                { keyword: `what is the best brand of ${niche}` },
                { keyword: `${products[0] ? products[0].name : niche} vs competitors` }
            ]
        };

        return res.status(200).json({ success: true, keywords: mockData });

    } catch (error) {
        console.error('Error in /api/analyze-keywords:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
