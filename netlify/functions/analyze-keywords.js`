const axios = require('axios');

exports.handler = async (event) => {
  const { niche } = JSON.parse(event.body || '{}');
  const apiKey = process.env.SERP_API_KEY;

  if (!niche || !apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing niche or API key' })
    };
  }

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: `${niche} business ideas`,
        engine: 'google',
        api_key: apiKey
      }
    });

    const questions = response.data.related_questions?.map(q => q.question) || [];
    const organic = response.data.organic_results?.slice(0, 5).map(r => r.title) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        keywords: [...questions, ...organic]
      })
    };
  } catch (error) {
    console.error('SerpApi error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Keyword analysis failed' })
    };
  }
};
