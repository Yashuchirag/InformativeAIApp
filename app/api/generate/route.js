export const runtime = 'edge';

export async function POST(req) {
  try {
    const ct = req.headers.get('content-type') || '';

    let prompt = '';
    let modelKey = '';

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      prompt = String(form.get('prompt') || '');
      modelKey = String(form.get('model') || form.get('modelId') || '');
    } else {
      const body = await req.json().catch(() => ({}));
      prompt = String(body.prompt || '');
      modelKey = String(body.model || body.modelId || '');
    }

    // Basic Validation
    if (!prompt.trim()) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Allowlist + fallback
    const DEFAULT_MODEL = 'gpt-4o-mini';
    const ALLOWED = new Set(['gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-mini']); // add more if you enable them
    const model = ALLOWED.has(modelKey) ? modelKey : DEFAULT_MODEL;
    console.log(model);

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    

    // handle openai errors
    if (!r.ok) {
      const contentType = r.headers.get('content-type') || '';
      const raw = await r.text();
      return new Response(raw, {
        status: r.status,
        headers: { 'content-type': contentType.includes('application/json') ? 'application/json' : 'text/plain' },
      });
    }

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content ?? '';

    return Response.json({ answer });

  } catch (e) {
    return Response.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}
