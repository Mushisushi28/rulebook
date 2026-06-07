import { getGame, getAllSlugs } from '@/lib/games';
import { markdownToHtml } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import GamePageClient from './GamePageClient';

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.name} — Rulebook`,
    description: game.summary,
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const contentHtml = await markdownToHtml(game.content);
  const hasFullRules = !game.content.includes('Rules Coming Soon') && !game.content.includes('coming soon');

  return (
    <GamePageClient
      game={game}
      contentHtml={contentHtml}
      hasFullRules={hasFullRules}
    />
  );
}
