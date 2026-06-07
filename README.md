# Rulebook

AI-grounded rulebook for family board games. Pick a game, read the full rules, ask an AI rulemaster anything — answers grounded in the official ruleset only.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- Marginalia visual system (Fraunces + JetBrains Mono, warm dark palette)
- Rules stored as MDX in `content/games/`
- Chat proxied through FreeLLMAPI (`FREELLMAPI_BASE_URL`)

## Environment Variables

Set these in Vercel (Settings → Environment Variables):

| Variable | Description |
|---|---|
| `FREELLMAPI_BASE_URL` | FreeLLMAPI proxy base URL, e.g. `https://your-tunnel.trycloudflare.com/v1` |
| `FREELLMAPI_TOKEN` | Bearer token for the FreeLLMAPI proxy |

**TODO:** Replace placeholder values once Weekend Linux deploy is complete. The proxy is expected to be reachable at `http://weekend.local:3001/v1/chat/completions` or via a cloudflared tunnel. Update `FREELLMAPI_BASE_URL` in Vercel env and redeploy.

## Games

8 games with full rules: Catan, Codenames, Ticket to Ride, Pandemic, Carcassonne, Uno, Scrabble, Risk

12 games with placeholder: Monopoly, Clue, Sorry!, Phase 10, Yahtzee, Dominion, 7 Wonders, Splendor, Bananagrams, Sushi Go!, Telestrations, Wingspan

## Dev

```bash
npm run dev
```

## License

MIT
