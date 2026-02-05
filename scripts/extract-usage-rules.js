#!/usr/bin/env node
/**
 * Extract Harmony usage rules from component and shell .astro doc pages.
 * Writes docs/RULES.md. Run automatically on `npm run build`, or:
 *   node scripts/extract-usage-rules.js
 *   HARMONY_ROOT=/path node scripts/extract-usage-rules.js  (when run from another repo)
 *
 * HEADING PATTERNS - Validated across multiple components, Feb 2025.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CONFIG - match by class substring + text (case-insensitive)
// ---------------------------------------------------------------------------

const H2_SELECTOR = 'section__title';

const TARGET_SECTIONS = [
  'usage guidelines',
  'usage',
  'accessibility',
  'layout',
  'implementation notes',
  'best practices',
  'behavior'
];

const SKIP_SECTIONS = [
  'examples',
  'props',
  'input props',
  'textarea props'
];

const SKIP_TITLE_PATTERNS = [
  'basic table', 'striped table', 'table with ', 'icon selection guide',
  'live demo', 'live interactive demo', 'theme-specific', 'shell components',
  'overview', 'product availability', 'visual elements', 'card variants',
  'layout & spacing', 'content patterns', 'header variant', 'related components'
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHarmonyRoot() {
  const env = process.env.HARMONY_ROOT;
  if (env) return path.resolve(env);
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--harmony-root=')) {
      return path.resolve(arg.slice('--harmony-root='.length));
    }
  }
  return path.resolve(__dirname, '..');
}

function componentNameFromFilename(filename) {
  const base = path.basename(filename, '.astro');
  return base
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeSectionTitle(text) {
  return (text || '').toLowerCase().trim();
}

function shouldSkipSection(normalized) {
  if (!normalized) return true;
  if (SKIP_SECTIONS.some(s => normalized === s || normalized.startsWith(s))) return true;
  if (SKIP_TITLE_PATTERNS.some(p => normalized.includes(p))) return true;
  return false;
}

function extractH2Sections(html) {
  const sections = [];
  const h2Regex = new RegExp(
    `<h2[^>]*class="[^"]*${H2_SELECTOR}[^"]*"[^>]*>([\\s\\S]*?)</h2>`,
    'gi'
  );
  let match;
  const h2Matches = [];
  while ((match = h2Regex.exec(html)) !== null) {
    const titleHtml = match[1];
    const text = stripTags(titleHtml).trim();
    const start = match.index;
    h2Matches.push({ text: normalizeSectionTitle(text), rawTitle: text, start, end: match.index + match[0].length });
  }
  for (let i = 0; i < h2Matches.length; i++) {
    const current = h2Matches[i];
    const nextStart = i + 1 < h2Matches.length ? h2Matches[i + 1].start : html.length;
    const content = html.slice(current.end, nextStart);
    if (shouldSkipSection(current.text)) continue;
    const targetKey = TARGET_SECTIONS.find(t => current.text === t || current.text.startsWith(t));
    if (!targetKey) continue;
    sections.push({
      title: current.rawTitle,
      normalizedTitle: current.text,
      targetKey,
      content: content.trim()
    });
  }
  return sections;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlToMarkdown(html) {
  let md = html
    .replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, (_, attrs, inner) => '### ' + stripTags(inner) + '\n\n')
    .replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, (_, attrs, inner) => '#### ' + stripTags(inner) + '\n\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return md;
}

function readAstroFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const names = fs.readdirSync(dir);
  return names
    .filter(n => n.endsWith('.astro'))
    .map(n => path.join(dir, n));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const harmonyRoot = getHarmonyRoot();
const componentsDir = path.join(harmonyRoot, 'src', 'pages', 'components');
const shellDir = path.join(harmonyRoot, 'src', 'pages', 'shell');
const outputPath = path.join(harmonyRoot, 'docs', 'RULES.md');

const bySection = {};
TARGET_SECTIONS.forEach(t => { bySection[t] = []; });

function processFile(filePath, sourceLabel) {
  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn('Skip (unreadable):', filePath);
    return;
  }
  const sections = extractH2Sections(html);
  for (const sec of sections) {
    const targetKey = sec.targetKey;
    const md = htmlToMarkdown(sec.content);
    if (!md) continue;
    bySection[targetKey].push({ component: sourceLabel, title: sec.title, content: md });
  }
}

const componentFiles = readAstroFiles(componentsDir);
const shellFiles = readAstroFiles(shellDir);

componentFiles.forEach(f => {
  const label = componentNameFromFilename(f);
  processFile(f, label);
});
shellFiles.forEach(f => {
  const label = 'Shell: ' + componentNameFromFilename(f);
  processFile(f, label);
});

const lines = [
  '# Harmony Usage Rules',
  '',
  'Generated from Harmony component and shell doc pages. Do not edit by hand; run `npm run build` or `node scripts/extract-usage-rules.js` to refresh.',
  ''
];

const sectionTitles = {
  'usage guidelines': 'Usage Guidelines',
  'usage': 'Usage',
  'accessibility': 'Accessibility',
  'layout': 'Layout',
  'implementation notes': 'Implementation Notes',
  'best practices': 'Best Practices',
  'behavior': 'Behavior'
};

for (const key of TARGET_SECTIONS) {
  const entries = bySection[key];
  if (!entries || entries.length === 0) continue;
  const title = sectionTitles[key] || key;
  lines.push('## ' + title);
  lines.push('');
  for (const e of entries) {
    lines.push('### ' + e.component + (e.title !== title ? ' — ' + e.title : ''));
    lines.push('');
    lines.push(e.content);
    lines.push('');
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log('Wrote', outputPath);
