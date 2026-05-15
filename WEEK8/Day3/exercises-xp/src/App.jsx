import React from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { CharacterCounter } from './CharacterCounter';
import './App.css';

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <div className={`app-container ${theme}`}>
      <h1>Day 3 Exercises XP</h1>
      <ThemeSwitcher />
      <hr />
      <CharacterCounter />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
