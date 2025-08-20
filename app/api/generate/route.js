export const runtime = 'edge';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Basic Validation
    if (!prompt?.trim()) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
