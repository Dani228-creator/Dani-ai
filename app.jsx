import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('answer');

  const API_BASE = 'http://localhost:5000/api';

  const handleGetAnswer = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    setLoading(true);
    setAnswer('');
    setResults([]);

    try {
      const response = await fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.success) {
        setAnswer(data.answer);
        setResults(data.sources);
        setActiveTab('answer');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to get answer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    setLoading(true);
    setResults([]);
    setAnswer('');

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        setActiveTab('results');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🤖 AI Question Answerer</h1>
          <p>Get instant answers powered by Google Search</p>
        </header>

        {/* Search Form */}
        <form className="search-form" onSubmit={handleGetAnswer}>
          <div className="input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any question..."
              className="search-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '✨ Get Answer'}
            </button>
            <button 
              type="button" 
              onClick={handleSearch}
              className="btn btn-secondary"
              disabled={loading}
            >
              🔍 Search
            </button>
          </div>
        </form>

        {/* Tabs */}
        {(answer || results.length > 0) && (
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'answer' ? 'active' : ''}`}
              onClick={() => setActiveTab('answer')}
            >
              Answer
            </button>
            <button 
              className={`tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Sources ({results.length})
            </button>
          </div>
        )}

        {/* Answer Section */}
        {activeTab === 'answer' && answer && (
          <div className="answer-section">
            <div className="answer-card">
              <h2>📝 Answer</h2>
              <p className="answer-text">{answer}</p>
              {results.length > 0 && (
                <div className="answer-sources">
                  <h4>Sources:</h4>
                  <ul>
                    {results.map((source, idx) => (
                      <li key={idx}>
                        <a href={source.link} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {activeTab === 'results' && results.length > 0 && (
          <div className="results-section">
            <h2>🔎 Search Results</h2>
            <div className="results-grid">
              {results.map((result, idx) => (
                <div key={idx} className="result-card">
                  <a 
                    href={result.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="result-title"
                  >
                    {result.title}
                  </a>
                  <p className="result-source">{result.displayLink}</p>
                  <p className="result-snippet">{result.snippet}</p>
                  <a 
                    href={result.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="result-link"
                  >
                    Visit Source →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!answer && results.length === 0 && !loading && (
          <div className="empty-state">
            <p>💡 Ask a question and get instant answers</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
