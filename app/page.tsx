import { getAllGames, hasFullRules } from '@/lib/games';
import HomeClient from './HomeClient';

export default function HomePage() {
  const games = getAllGames();
  const gamesWithStatus = games.map(g => ({
    ...g,
    hasFull: hasFullRules(g.summary), // We'll check content in client; pass a computed field
  }));

  return <HomeClient games={games} />;
}
