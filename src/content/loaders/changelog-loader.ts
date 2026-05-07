import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Custom content loader for changelog entries
 * Reads changelog data from changelog.json and makes it available via Astro's Content Collections API
 */
export async function changelogLoader() {
  const changelogPath = join(process.cwd(), 'changelog-data/changelog.json');

  // Check if changelog file exists
  if (!existsSync(changelogPath)) {
    console.info('📝 No changelog data found. Run `npm run changelog` or `npm run changelog:snapshot` locally to generate data.');
    return [];
  }

  try {
    const fileContent = await readFile(changelogPath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.entries || !Array.isArray(data.entries)) {
      console.warn('Changelog data is malformed, returning empty array');
      return [];
    }

    // Map entries to the format expected by Content Collections
    return data.entries.map((entry: any) => ({
      id: entry.id,
      ...entry,
    }));
  } catch (error) {
    console.error('Failed to load changelog data:', error);
    return [];
  }
}
