export const runtime = 'edge';

export async function POST(req) {
    try {
        const { prompt } = await req.json();
        if (!prompt || !prompt.trim()) {
            return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return new Response(JSON.stringify({ error: text }), { status: response.status });
        }

        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content ?? '';
        return new Response(JSON.stringify({ answer }), { status: 200 });

    } catch (error) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
}
