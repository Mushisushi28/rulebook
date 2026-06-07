'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GameFrontmatter } from '@/lib/games';

const FULL_RULES_SLUGS = ['catan', 'codenames', 'ticket-to-ride', 'pandemic', 'carcassonne', 'uno', 'scrabble', 'risk'];

interface Props {
  games: GameFrontmatter[];
}

const complexityColors: Record<string, string> = {
  'Light': '#6b8f71',
  'Light–Medium': '#8f8a6b',
  'Medium': '#8f7a6b',
  'Medium–Heavy': '#8f6b6b',
  'Heavy': '#8f6b6b',
};

export default function HomeClient({ games }: Props) {
  const [query, setQuery] = useState('');

  const filtered = games.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.summary.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--rule)',
        padding: '2rem 1.5rem 1.5rem',
        maxWidth: '72rem',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            Rulebook
          </h1>
          <span className="mono" style={{
            color: 'var(--accent)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            alignSelf: 'center',
          }}>
            AI-grounded
          </span>
        </div>
        <p style={{
          color: 'var(--ink-dim)',
          fontSize: '0.95rem',
          marginTop: '0.5rem',
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 300,
        }}>
          Pick a game. Read the rules. Ask the Rulemaster anything.
        </p>
      </header>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Section label */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="mono" style={{
            color: 'var(--accent)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            № 01 — Catalog
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search games…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '24rem',
              background: 'var(--bg-raised)',
              border: '1px solid var(--rule)',
              borderRadius: '4px',
              color: 'var(--ink)',
              padding: '0.6rem 0.85rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Game Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(game => {
            const hasFull = FULL_RULES_SLUGS.includes(game.slug);
            return (
              <Link key={game.slug} href={`/game/${game.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--rule)',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  transition: 'border-color 0.15s, background 0.15s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-dim)';
                    (e.currentTarget as HTMLDivElement).style.background = '#1f1d19';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--rule)';
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-raised)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontWeight: 300,
                      fontSize: '1.1rem',
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                    }}>
                      {game.name}
                    </h2>
                    {hasFull && (
                      <span className="mono" style={{
                        color: 'var(--accent)',
                        fontSize: '0.55rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        background: 'var(--highlight)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                        marginLeft: '0.5rem',
                        marginTop: '2px',
                      }}>
                        Full rules
                      </span>
                    )}
                  </div>

                  <div className="mono" style={{
                    color: 'var(--ink-dim)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}>
                    <span>{game.players} players</span>
                    <span>{game.time}</span>
                    <span>Age {game.age}</span>
                  </div>

                  <p style={{
                    color: 'var(--ink-dim)',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                    flexGrow: 1,
                  }}>
                    {game.summary}
                  </p>

                  <div className="mono" style={{
                    color: complexityColors[game.complexity] ?? 'var(--ink-dim)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 'auto',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--rule)',
                  }}>
                    {game.complexity}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: 'var(--ink-dim)', fontStyle: 'italic', marginTop: '2rem' }}>
            No games match &ldquo;{query}&rdquo;.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--rule)',
        padding: '2rem 1.5rem',
        maxWidth: '72rem',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span className="mono" style={{ color: 'var(--ink-dim)', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
          Rulebook — rulemaster AI grounded in official publisher rules
        </span>
        <a
          href="https://github.com/Mushisushi28/rulebook"
          target="_blank"
          rel="noopener noreferrer"
          className="mono"
          style={{
            color: 'var(--accent)',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}
        >
          github.com/Mushisushi28/rulebook
        </a>
      </footer>
    </div>
  );
}
