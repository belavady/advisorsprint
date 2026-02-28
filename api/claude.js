// AdvisorSprint API Proxy - Vercel Serverless Function
const { Redis } = require('@upstash/redis');

// Tool-specific limits
const LIMITS = {
  'advisor': 999999,
  'strategic-sprint': 999999
};

const COOLDOWN_MINUTES = 10;

// Wave 1 agents
const SPRINT_START_AGENTS = ['signals', 'market'];

// Model selection - TESTING WITH SONNET 4.6
function getModelForAgent(agentId) {
  // Use Sonnet 4.6 for all agents
  return 'claude-sonnet-4-6-20250514';
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tool-name');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, pdfs = [], agentId } = req.body;
    const tool = req.headers['x-tool-name'] || 'advisor';

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Get model for this agent
    const model = getModelForAgent(agentId);

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: agentId === 'synopsis' ? 4000 : agentId === 'synergy' ? 3500 : 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', errorText);
      return res.status(anthropicResponse.status).json({ 
        error: 'AI service error', 
        details: errorText 
      });
    }

    const data = await anthropicResponse.json();
    const text = data.content?.[0]?.text || '';

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

