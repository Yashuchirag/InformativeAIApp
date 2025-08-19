'use client';
import { useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "ai-history_v1";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });


    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const canSubmit = useMemo(() => {
        return prompt.trim() !== '' && !loading;
    }, [prompt, loading]);

    const submit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            setHistory((prev) => [...prev, { prompt, response: data.response }]);
            setPrompt('');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <main className="wrap">
            <div className="card">
                <header>
                    <h1>AI Prompt</h1>
                    <p>Enter your prompt below and click generate to get a response</p>
                    <button className="ghost" onClick={clearAll}>Clear All</button>
                </header>

                <label classname="label">Your Prompt</label>
                <textarea 
                    placeholder="Ask anything..." 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                />

                <div className="row">
                    <button className="primary" onClick={submit} disabled={!canSubmit}>
                        {loading ? 'Thinking...' : 'Submit'}
                    </button>
                    <span className="error">
                        {error ? `Error: ${error}` : loading ? 'Contacting model...' : 'Ready to generate'}
                    </span>
                </div>

                <section className='history'>
                    {history.length === 0 && <div className="item">No history yet</div>}
                    {history.map((item, index) => (
                        <article className="item" key={item.id}>
                            <div className="label">Prompt</div>
                            <pre>{item.prompt}</pre>
                            <div className="label">Response</div>
                            <pre>{item.answer}</pre>
                        </article>
                    ))}
                </section>                
            </div>
        </main>
    );
}
