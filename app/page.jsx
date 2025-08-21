'use client';
import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, ThemeToggleButton } from './themePage';
import './globals.css';

const STORAGE_KEY = 'ai-history_v1';


export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);

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

  const handleTextAreaKeyDown = (event) => {
    if (event.key == 'Enter') {
      if (event.shiftKey){
        return;
      }
      event.preventDefault();
      if (canSubmit){ submit()};
    }
  };
  const handleFileSelect = (picked) => setFile(picked || null);

  const canSubmit = useMemo(() => prompt.trim() !== '' && !loading, [prompt, loading]);
  
  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      let res;

      if(file){
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('file', file);
        res = await fetch('/api/generate', {
          method: 'POST',
          body: form,
        });
      }else{
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      }

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
        fileName: file?.name ?? null,
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
    <ThemeProvider>    
      <main className="wrap">
        
        <div className="card">
          <header className="header">
            <h1>Got a Question? 🤔</h1>
            <p>Type your question or drop in a file, and let AI generate the answer for you.</p>
            <ThemeToggleButton/>
          </header>

          <label className="label" htmlFor="prompt">Your Prompt</label>
          <textarea
            id="prompt"
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleTextAreaKeyDown}
          />

          <label className="label" htmlFor="file"></label>
          <input
            id="file"
            type="file"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
          {
            file && (
              <div className="file-info"> 
                <span>Selected file: <strong>{file.name}</strong></span>
                <button onClick={() => setFile(null)}
                  disabled={loading}
                  >
                  Remove
                </button>
              </div>
            )
          }

          <div className="row">
            <button className="primary" onClick={submit} disabled={!canSubmit}>
              {loading ? 'Waiting for response...' : 'Submit'}
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
    </ThemeProvider>
  );
}
