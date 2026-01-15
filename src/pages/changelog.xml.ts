import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const entries = await getCollection('changelog');

  // Sort by date descending (most recent first)
  const sortedEntries = entries.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Harmony Design System Changelog',
    description: 'All notable changes to the Harmony Design System, automatically tracked',
    site: context.site?.toString() || 'https://harmonycomponents.com',
    items: sortedEntries.map((entry) => {
      const breaking = entry.data.breaking ? ' [BREAKING]' : '';
      const categoryEmoji = {
        added: '✅',
        changed: '🔄',
        deprecated: '⚠️',
        removed: '🗑️',
        fixed: '🔧',
        security: '🔒'
      }[entry.data.category] || '📝';

      return {
        title: `${categoryEmoji} ${entry.data.category}: ${entry.data.target}${breaking}`,
        description: entry.data.description,
        pubDate: new Date(entry.data.date),
        link: `/changelog/#${entry.id}`,
        categories: [entry.data.category, entry.data.type],
        author: entry.data.commit?.author || 'Design System Team',
        customData: entry.data.commit ? `
          <commit>
            <hash>${entry.data.commit.hash}</hash>
            <message>${entry.data.commit.message}</message>
          </commit>
        ` : ''
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
