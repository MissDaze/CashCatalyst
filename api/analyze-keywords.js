export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    // This is a template. The real logic to call SerpApi or another keyword tool would go here.
    try {
        const { niche } = req.body;
        const mockData = {
            primary: [{ keyword: `best ${niche}`, volume: '15,000' }, { keyword: `${niche} reviews`, volume: '9,500' }],
            longTail: [{ keyword: `how to choose ${niche}` }, { keyword: `top brands for ${niche}` }]
        };
        res.status(200).json({ success: true, keywords: mockData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
