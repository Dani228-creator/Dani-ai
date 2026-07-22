const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CSE_ID;

// Cache to avoid duplicate queries
const cache = new Map();

// Main search function
async function searchGoogle(query) {
  // Check cache first
  if (cache.has(query)) {
    return cache.get(query);
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1`;
    const response = await axios.get(url, {
      params: {
        q: query,
        key: API_KEY,
        cx: CX,
        num: 10, // Get top 10 results
      },
    });

    const results = response.data.items?.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
    })) || [];

    // Cache the result
    cache.set(query, results);
    setTimeout(() => cache.delete(query), 3600000); // Cache for 1 hour

    return results;
  } catch (error) {
    console.error('Google Search API error:', error.message);
    throw new Error('Failed to search Google');
  }
}

// Extract answer from search results
function extractAnswer(results) {
  if (results.length === 0) return 'No results found';
  
  // Combine snippets from top results
  const answer = results
    .slice(0, 3)
    .map(r => r.snippet)
    .join(' ... ');
  
  return answer;
}

// API Routes
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }

    const results = await searchGoogle(query);
    res.json({
      success: true,
      query,
      results,
      totalResults: results.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/answer', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }

    const results = await searchGoogle(query);
    const answer = extractAnswer(results);

    res.json({
      success: true,
      query,
      answer,
      sources: results.slice(0, 3).map(r => ({
        title: r.title,
        link: r.link,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
