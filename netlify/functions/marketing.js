const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
  const { niche, products } = JSON.parse(event.body || '{}');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!niche || !products?.length || !apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing inputs or API key' })
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate a comprehensive marketing campaign for a niche business in "${niche}".
Focus on these products: ${products.join(', ')}.

Respond with:
1. Catchy ad headlines
2. Ad body copy
3. A short blog/article intro
4. Suggested channels (social, search, email)
5. Bonus: unique promotional hook or call-to-action
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ marketing: output })
    };
  } catch (error) {
    console.error('Gemini error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate content' })
    };
  }
};
