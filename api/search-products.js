/**
 * API for searching products based on a niche.
 * In a real application, this would call external APIs like Amazon, CJ, ShareASale, or use a web scraping service.
 * For now, it returns realistic mock data.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { niche, businessType } = req.body;

        // Basic validation
        if (!niche || !businessType) {
            return res.status(400).json({ success: false, error: 'Niche and businessType are required.' });
        }

        console.log(`[API] Searching for niche: "${niche}", type: "${businessType}"`);

        // Simulate an API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- REAL LOGIC WOULD GO HERE ---
        // Example: const products = await callAmazonApi(niche);

        // For now, return realistic mock data based on the business type
        let mockData = [];
        if (businessType === 'affiliate') {
            mockData = [
                { name: `The Ultimate ${niche} Masterkit`, description: "High-ticket item with a 20% commission rate." },
                { name: `Compact ${niche} Solution for Beginners`, description: "Perfect entry-level product, easy to promote." },
                { name: `Pro-Series ${niche} Gadget`, description: "For the enthusiast, with recurring commission potential." }
            ];
        } else { // dropshipping
            mockData = [
                { name: `Premium Wireless ${niche} Device`, description: "High-perceived value, great profit margin. Supplier: TechSource." },
                { name: `Eco-Friendly ${niche} Set`, description: "Appeals to conscious consumers. Supplier: GreenDropship." },
                { name: `Customizable LED ${niche} Hub`, description: "Viral potential on TikTok. Supplier: GlowFactory." }
            ];
        }

        return res.status(200).json({ success: true, products: mockData });

    } catch (error) {
        console.error('Error in /api/search-products:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
