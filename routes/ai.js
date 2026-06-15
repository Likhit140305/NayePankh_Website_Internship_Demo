const express = require('express');
const router = express.Router();

// ── POST /api/ai/generate ────────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(503).json({ 
      error: 'Gemini API key is not configured on the server. Please set the GEMINI_API_KEY environment variable, or enter your key in the browser input field.' 
    });
  }

  const { systemInstruction, contents } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, contents })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('AI Proxy Error:', err);
    res.status(500).json({ error: 'Failed to communicate with Gemini API: ' + err.message });
  }
});

module.exports = router;
