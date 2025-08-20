'use client';
import { useEffect, useMemo, useState } from 'react';
import './globals.css';

const STORAGE_KEY = 'ai-history_v1';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const canSubmit = useMemo(() => prompt.trim() !== '' && !loading, [prompt, loading]);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { error: raw }; }

      if (!res.ok) throw new Error(data?.error || 'Request failed');

      // Support either {answer} or {response}
      const answer = data.answer ?? data.response ?? '';

      const item = {
        id: crypto.randomUUID(),
        prompt,
        answer,
        ts: Date.now(),
      };
      setHistory(prev => [item, ...prev]);   // newest first
      setPrompt('');
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (confirm('Clear all history?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <main className="wrap">
      <div className="card">
        <header className="header">
          <h1>AI Prompt Using React App</h1>
          <p>Enter your prompt below and click submit to get a response</p>
        </header>

        <label className="label" htmlFor="prompt">Your Prompt</label>
        <textarea
          id="prompt"
          placeholder="Ask anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="row">
          <button className="primary" onClick={submit} disabled={!canSubmit}>
            {loading ? 'Thinking...' : 'Submit'}
          </button>
          <span className={error ? 'error' : 'status'}>
            {error ? `Error: ${error}` : loading ? 'Contacting model...' : 'Ready to generate'}
          </span>
          <button className="ghost" onClick={clearAll}>Clear All</button>
        </div>

        <section className="history">
          {history.length === 0 && <div className="item"><em>No history yet</em></div>}
          {history.map((item) => (
            <article className="item" key={item.id}>
              <div className="label">Prompt</div>
              <pre>{item.prompt}</pre>
              <div className="label" style={{ marginTop: 8 }}>Response</div>
              <pre>{item.answer}</pre>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
