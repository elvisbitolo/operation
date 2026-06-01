import React from 'react';
import { useTheme } from './ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`theme-switcher ${theme}`}>
      <h2>Exercise 1: Theme Switcher</h2>
      <p>Current Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
