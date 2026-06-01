import React from 'react';
import './App.css';
import Car from './components/Car';
import Events from './components/Events';
import Phone from './components/Phone';
import Color from './components/Color';
import VotingApp from './components/VotingApp';

function App() {
  const carinfo = { name: "Ford", model: "Mustang" };

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>React Components & State</h1>
        <p>Week 7 Day 5 Exercises</p>
      </header>
      
      <main className="content-grid">
        <Car carInfo={carinfo} />
        <Events />
        <Phone />
        <Color />
        <VotingApp />
      </main>

      <footer className="main-footer">
        <p>&copy; 2026 Developers Institute - Elvis Bitolo</p>
      </footer>
    </div>
  );
}

export default App;
