export const runtime = 'edge';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',            // ask for JSON
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // If using GitHub Models, use a GitHub token here
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        stream: false,                            // ensure non-streaming response
      }),
    });

    const contentType = r.headers.get('content-type') || '';
    const raw = await r.text();

    if (!r.ok) {
      // pass through server error as-is with the correct content type
      return new Response(raw, {
        status: r.status,
        headers: { 'content-type': contentType.includes('application/json') ? 'application/json' : 'text/plain' },
      });
    }

    // ---- Robust parse: JSON first, otherwise try SSE lines ----
    let data;
    try {
      if (contentType.includes('application/json')) {
        data = JSON.parse(raw);
        console.log(data);
      } else if (contentType.includes('text/event-stream') || raw.startsWith('data:')) {
        // Grab the last non-[DONE] data event and parse it
        const last = raw
          .trim()
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trim())
          .filter((d) => d && d !== '[DONE]')
          .pop();
        data = last ? JSON.parse(last) : null;
      } else {
        throw new Error(`Unexpected content-type: ${contentType}`);
      }
    } catch {
      throw new Error(`Unexpected non-JSON response: ${raw.slice(0, 120)}`);
    }

    const answer = data?.choices?.[0]?.message?.content ?? '';
    return Response.json({ answer });
  } catch (e) {
    return Response.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}
