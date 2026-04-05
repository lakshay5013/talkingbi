import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Search, Sparkles } from 'lucide-react';

export default function SearchInterface({ onQuerySubmit, onDatabaseConnect, onDatabaseDisconnect, isDatabaseConnected, databaseStatus }) {
  const [query, setQuery] = useState("");
  const [dbUrl, setDbUrl] = useState('');
  const [isListening, setIsListening] = useState(false);

  const suggestions = [
    "Show sales trend over last year",
    "What are the top 5 products?",
    "Show regional performance",
    "Compare B2B vs B2C revenue"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onQuerySubmit(query);
    }
  };

  const handleSurpriseMe = () => {
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setQuery(random);
    setTimeout(() => onQuerySubmit(random), 300);
  };

  const toggleMic = () => {
    setIsListening(true);
    // Mock listening duration then auto-submit
    setTimeout(() => {
      setQuery("Show me the profit by region");
      setIsListening(false);
      setTimeout(() => onQuerySubmit("Show me the profit by region"), 500);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="query-interface"
    >
      <div className="query-header">
        <span className="query-badge">
          <Sparkles size={14} />
          Conversational Analytics
        </span>
        <h2>Ask your business data</h2>
        <p>Type a natural-language query to generate BI-ready visualizations and insight summaries.</p>
      </div>

      <form onSubmit={handleSubmit} className="query-form">
        <div className="query-input-wrap">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Show monthly revenue trend by region"
            autoFocus
          />

          <div className="query-actions">
            <button
              type="button"
              onClick={toggleMic}
              className={`icon-btn ${isListening ? 'listening' : ''}`}
              aria-label="Voice input"
            >
              <Mic size={16} />
            </button>
            <button type="submit" className="btn-primary">
              Generate
            </button>
          </div>
        </div>

        <div className="dataset-input-row">
          <input
            type="text"
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            placeholder="Enter database connection URL (postgresql://user:password@host:5432/dbname)"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onDatabaseConnect?.(dbUrl)}
          >
            Connect Database
          </button>
          {isDatabaseConnected ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onDatabaseDisconnect?.()}
            >
              Disconnect Database
            </button>
          ) : null}
        </div>
        {databaseStatus ? <p className="dataset-status">{databaseStatus}</p> : null}

        <AnimatePresence>
          {isListening && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="listening-text"
            >
              Listening for your query...
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      <div className="query-suggestions">
        <button type="button" onClick={handleSurpriseMe} className="btn-secondary">
          Surprise Me
        </button>
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setQuery(s);
              setTimeout(() => onQuerySubmit(s), 300);
            }}
            className="suggestion-chip"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
