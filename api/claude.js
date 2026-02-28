module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tool-name');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, agentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Model: Sonnet 4.6 for all agents
    const model = 'claude-sonnet-4-6-20250514';

    // Max tokens based on agent
    const maxTokens = agentId === 'synopsis' ? 4000 
                    : (agentId === 'synergy' || agentId === 'platform') ? 3500 
                    : 1500;

    console.log(`[${new Date().toISOString()}] Agent: ${agentId}, Model: ${model}`);

    // Call Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic error:', error);
      return res.status(response.status).json({ 
        error: 'AI service error',
        details: error 
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    console.log(`[${new Date().toISOString()}] Success: ${text.length} chars`);

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};
