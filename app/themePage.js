// themePage.js
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // initialize from localStorage or system preference
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('app-theme') : null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // persist + reflect to <html data-theme="...">
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button className="ghost" onClick={toggleTheme} title="Toggle theme">
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
  );
}