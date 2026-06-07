import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml, { sanitize: false }).process(markdown);
  return result.toString();
}
