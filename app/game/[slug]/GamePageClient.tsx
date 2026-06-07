'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Game } from '@/lib/games';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  game: Game;
  contentHtml: string;
  hasFullRules: boolean;
}

export default function GamePageClient({ game, contentHtml, hasFullRules }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          gameRules: game.content,
          gameName: game.name,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? data.error ?? 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not reach the Rulemaster. Make sure FREELLMAPI_BASE_URL and FREELLMAPI_TOKEN are set in your Vercel environment.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Top nav */}
      <nav style={{
        borderBottom: '1px solid var(--rule)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--ink-dim)',
          }}>
            Rulebook
          </span>
        </Link>
        <span style={{ color: 'var(--rule)', fontSize: '0.75rem' }}>›</span>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 300,
          fontSize: '1rem',
          color: 'var(--ink)',
        }}>
          {game.name}
        </span>
      </nav>

      {/* Game hero */}
      <div style={{
        borderBottom: '1px solid var(--rule)',
        padding: '1.75rem 1.5rem 1.5rem',
        maxWidth: '80rem',
        margin: '0 auto',
      }}>
        <div className="mono" style={{
          color: 'var(--accent)',
          fontSize: '0.62rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          № 02 — Codex
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '0.75rem',
        }}>
          {game.name}
        </h1>
        <div className="mono" style={{
          color: 'var(--ink-dim)',
          fontSize: '0.68rem',
          letterSpacing: '0.07em',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem',
        }}>
          <span>{game.players} players</span>
          <span>{game.time}</span>
          <span>Age {game.age}</span>
          <span>{game.complexity}</span>
        </div>
        <p style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '48rem' }}>
          {game.summary}
        </p>
        {!hasFullRules && (
          <div style={{
            marginTop: '0.75rem',
            background: 'var(--highlight)',
            border: '1px solid var(--accent-dim)',
            borderRadius: '4px',
            padding: '0.6rem 0.85rem',
            fontSize: '0.82rem',
            color: 'var(--accent)',
            display: 'inline-block',
          }}>
            Partial rules — full ruleset coming soon
          </div>
        )}
      </div>

      {/* Main two-column layout */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 0 4rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
        minHeight: 'calc(100vh - 220px)',
      }}
      className="game-layout"
      >
        {/* Left: Rulebook */}
        <div style={{
          padding: '2rem 2rem 2rem 1.5rem',
          borderRight: '1px solid var(--rule)',
          overflowY: 'auto',
        }}>
          <div className="mono" style={{
            color: 'var(--accent)',
            fontSize: '0.62rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            № 02 — Rules
          </div>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule)' }}>
            <a
              href={game.attribution_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{
                color: 'var(--ink-dim)',
                fontSize: '0.65rem',
                letterSpacing: '0.07em',
                textDecoration: 'none',
              }}
            >
              ↗ Official rules source
            </a>
          </div>
        </div>

        {/* Right: Chat */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 220px)',
          position: 'sticky',
          top: 0,
        }}>
          {/* Chat header */}
          <div style={{
            padding: '1.5rem 1.5rem 1rem',
            borderBottom: '1px solid var(--rule)',
          }}>
            <div className="mono" style={{
              color: 'var(--accent)',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
            }}>
              № 03 — Ask
            </div>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 300,
              fontSize: '0.95rem',
              color: 'var(--ink-dim)',
            }}>
              Ask the Rulemaster
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {messages.length === 0 && (
              <div style={{
                color: 'var(--ink-dim)',
                fontSize: '0.82rem',
                fontStyle: 'italic',
                lineHeight: 1.6,
                textAlign: 'center',
                marginTop: '2rem',
              }}>
                Ask anything about {game.name} — the Rulemaster answers only from the official rulebook.
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div className="mono" style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                  marginBottom: '0.3rem',
                }}>
                  {msg.role === 'user' ? 'you' : 'rulemaster'}
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--highlight)' : 'var(--bg-raised)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--accent-dim)' : 'var(--rule)'}`,
                  borderRadius: '6px',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'var(--ink)',
                  maxWidth: '90%',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '0.3rem',
              }}>
                <div className="mono" style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                }}>
                  rulemaster
                </div>
                <div style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--rule)',
                  borderRadius: '6px',
                  padding: '0.7rem 0.9rem',
                  color: 'var(--ink-dim)',
                  fontSize: '0.82rem',
                }}>
                  <LoadingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{
            borderTop: '1px solid var(--rule)',
            padding: '1rem 1.5rem',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-end',
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${game.name}…`}
              rows={2}
              style={{
                flex: 1,
                background: 'var(--bg-raised)',
                border: '1px solid var(--rule)',
                borderRadius: '4px',
                color: 'var(--ink)',
                padding: '0.6rem 0.8rem',
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '0.85rem',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="mono"
              style={{
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-raised)',
                border: '1px solid var(--rule)',
                borderRadius: '4px',
                color: input.trim() && !loading ? 'var(--bg)' : 'var(--ink-dim)',
                padding: '0.6rem 1rem',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                height: '2.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .game-layout {
            grid-template-columns: 1fr !important;
          }
          .game-layout > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--rule);
          }
          .game-layout > div:last-child {
            height: 60vh !important;
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--ink-dim)',
            display: 'inline-block',
            animation: 'pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
