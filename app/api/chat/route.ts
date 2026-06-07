import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { messages, gameRules, gameName } = await req.json();

  const baseUrl = process.env.FREELLMAPI_BASE_URL ?? 'https://proxy.example.com/v1';
  const token = process.env.FREELLMAPI_TOKEN ?? 'freellmapi-placeholder-TBD';

  const systemPrompt = `You are the Rulemaster for ${gameName}. Your only source of truth is the official rulebook excerpted below.

Answer questions using ONLY the rules provided. If a question isn't answered by the rulebook below, say so honestly and direct the user to the official source. Do not invent rules. Respond conversationally in 1–3 paragraphs. Use a numbered list only when describing sequential steps.

---
${gameRules}
---`;

  const payload = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: false,
    max_tokens: 512,
    temperature: 0.3,
  };

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}: ${errText}` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content ?? 'No response from model.';
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to reach FreeLLMAPI: ${message}. Set FREELLMAPI_BASE_URL and FREELLMAPI_TOKEN in Vercel environment variables.` },
      { status: 503 }
    );
  }
}
