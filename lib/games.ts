import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface GameFrontmatter {
  name: string;
  slug: string;
  players: string;
  time: string;
  age: string;
  complexity: string;
  summary: string;
  attribution_url: string;
}

export interface Game extends GameFrontmatter {
  content: string;
}

const GAMES_DIR = path.join(process.cwd(), 'content', 'games');

export function getAllGames(): GameFrontmatter[] {
  const files = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.mdx'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(GAMES_DIR, file), 'utf-8');
    const { data } = matter(raw);
    return data as GameFrontmatter;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function getGame(slug: string): Game | null {
  const filePath = path.join(GAMES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { ...(data as GameFrontmatter), content };
}

export function getAllSlugs(): string[] {
  return fs.readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''));
}

export function hasFullRules(content: string): boolean {
  return !content.includes('Rules Coming Soon') && !content.includes('coming soon');
}
