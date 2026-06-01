import React, { useState, useEffect } from 'react';
import { quotes } from './quotes';
import './App.css';

const colors = [
  '#16a085', '#27ae60', '#2c3e50', '#f39c12', '#e74c3c', 
  '#9b59b6', '#FB6964', '#342224', '#472E32', '#BDBB99', 
  '#77B1A9', '#73A857'
];

export function QuoteGenerator() {
  const [quote, setQuote] = useState(null);
  const [color, setColor] = useState('#333');

  const getRandomQuote = (currentQuote) => {
    let newQuote;
    do {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      newQuote = quotes[randomIndex];
    } while (currentQuote && newQuote.quote === currentQuote.quote);
    return newQuote;
  };

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateNewQuote = () => {
    const newQuote = getRandomQuote(quote);
    const newColor = getRandomColor();
    setQuote(newQuote);
    setColor(newColor);
    
    // Apply background color to body
    document.body.style.backgroundColor = newColor;
  };

  // Initial load
  useEffect(() => {
    generateNewQuote();
  }, []);

  if (!quote) return null;

  return (
    <div id="quote-box" style={{ color: color }}>
      <div className="quote-text">
        <h1 id="text" style={{ color: color }}>
          "{quote.quote}"
        </h1>
      </div>
      <div className="quote-author">
        <span id="author">- {quote.author}</span>
      </div>
      <div className="buttons">
        <button 
          id="new-quote" 
          onClick={generateNewQuote}
          style={{ backgroundColor: color }}
        >
          New quote
        </button>
      </div>
    </div>
  );
}
