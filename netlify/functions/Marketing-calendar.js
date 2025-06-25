const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
  const { niche, products, tone = 'conversion-focused' } = JSON.parse(event.body || '{}');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!niche || !products?.length || !apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields or API key' })
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a digital marketing strategist.
Generate a detailed 30-day calendar for a new business in the "${niche}" niche.

The business offers: ${products.join(', ')}.
Tone: ${tone}

Include:
- Daily actions (e.g. FB ad, email blast, blog post)
- Channel (e.g. Instagram, Google Search, Email, TikTok)
- Estimated budget range per action
- Reference generated content (e.g. ad headlines/blogs)

Format it as a JSON array with objects containing:
{
  day: 1,
  action: "...",
  channel: "...",
  budget: "$...",
  notes: "..."
}
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ calendar: output })
    };
  } catch (error) {
    console.error('Calendar error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate marketing calendar' })
    };
  }
};
