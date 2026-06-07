import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// ─── Tool definitions (OpenAI function-calling schema) ─────────────────────
const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_game_rules',
      description:
        'Look up official rules for a board game from the local catalog. Use this first before web search.',
      parameters: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description:
              'Game slug — lowercase, hyphenated (e.g. chess, ticket-to-ride, catan).',
          },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description:
        'Search the web for nuanced strategy, variants, or rule clarifications not covered by the local catalog.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query.',
          },
        },
        required: ['query'],
      },
    },
  },
];

// ─── Tool handlers ──────────────────────────────────────────────────────────
async function handleGetGameRules(slug: string): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'content', 'games', `${slug}.md`),
    path.join(process.cwd(), 'content', 'games', `${slug}.mdx`),
  ];
  for (const filePath of candidates) {
    try {
      const body = await fs.readFile(filePath, 'utf-8');
      return body;
    } catch {
      // try next candidate
    }
  }
  return `No rules found for slug "${slug}". Try web_search or check the spelling.`;
}

async function handleWebSearch(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (tavilyKey && tavilyKey !== 'placeholder') {
    // Tavily Search API
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tavilyKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: 5,
        search_depth: 'basic',
        include_answer: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return `Search error (${res.status}): ${err}`;
    }

    const data = await res.json();
    const answer = data.answer ? `Summary: ${data.answer}\n\n` : '';
    const results = (data.results ?? [])
      .slice(0, 5)
      .map(
        (r: { title: string; url: string; content: string }, i: number) =>
          `[${i + 1}] ${r.title}\n${r.url}\n${r.content?.slice(0, 400)}`,
      )
      .join('\n\n');
    return answer + results;
  }

  return 'Web search unavailable: TAVILY_API_KEY not configured.';
}

// ─── Message types ──────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  name?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ─── Agentic loop ───────────────────────────────────────────────────────────
async function runAgenticLoop(
  messages: ChatMessage[],
  baseUrl: string,
  token: string,
): Promise<string> {
  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      stream: false,
      max_tokens: 1024,
      temperature: 0.3,
    };

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upstream error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    if (!choice) throw new Error('No choices in upstream response.');

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: choice.message?.content ?? null,
      tool_calls: choice.message?.tool_calls,
    };
    messages.push(assistantMsg);

    // If no tool calls, we have a final answer
    if (!choice.message?.tool_calls || choice.message.tool_calls.length === 0) {
      return choice.message?.content ?? 'No response from model.';
    }

    // Execute tool calls and append results
    for (const tc of choice.message.tool_calls as ToolCall[]) {
      let result: string;
      try {
        const args = JSON.parse(tc.function.arguments ?? '{}');
        if (tc.function.name === 'get_game_rules') {
          result = await handleGetGameRules(args.slug);
        } else if (tc.function.name === 'web_search') {
          result = await handleWebSearch(args.query);
        } else {
          result = `Unknown tool: ${tc.function.name}`;
        }
      } catch (err: unknown) {
        result = `Tool error: ${err instanceof Error ? err.message : String(err)}`;
      }

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: result,
        name: tc.function.name,
      });
    }
  }

  return 'Max iterations reached without final answer.';
}

// ─── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { messages, gameRules, gameName } = await req.json();

  const baseUrl = process.env.FREELLMAPI_BASE_URL ?? 'https://proxy.example.com/v1';
  const token = process.env.FREELLMAPI_TOKEN ?? 'freellmapi-placeholder-TBD';

  // Build system prompt — marginalia tone; prefer catalog before web
  const catalogNote = gameName
    ? `The user is currently viewing the rules for "${gameName}".${
        gameRules
          ? ` The rulebook excerpt is embedded below — consult it first.\n\n---\n${gameRules}\n---`
          : ''
      }\n\n`
    : '';

  const systemPrompt = `You are the Rulemaster — a knowledgeable, concise board-game rules reference. ${catalogNote}Tool priority:
1. Use get_game_rules first for any game-specific question. Pass the game's hyphenated slug (e.g. "chess", "catan", "ticket-to-ride").
2. Use web_search only when the local catalog has no entry, or when the user explicitly asks for strategy, variants, or community rulings.
3. Combine both tools freely if it improves the answer.

Tone: conversational, 1–3 paragraphs. Use numbered lists only for sequential steps. Be direct — don't hedge excessively.`;

  const chatHistory: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    const reply = await runAgenticLoop(chatHistory, baseUrl, token);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: `Chat error: ${message}. Ensure FREELLMAPI_BASE_URL, FREELLMAPI_TOKEN, and TAVILY_API_KEY are set in Vercel environment variables.`,
      },
      { status: 502 },
    );
  }
}
