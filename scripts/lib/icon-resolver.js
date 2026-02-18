/**
 * Resolve icon names to embedded SVG markup for deterministic component specs.
 * Reads from node_modules/heroicons (24/outline, 24/solid) or public/*.svg.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

/**
 * Resolve a single icon to its SVG string.
 * @param {string} name - Icon name (kebab-case, e.g. 'information-circle', 'x-mark')
 * @param {string} style - 'outline' | 'solid' (default 'outline')
 * @param {string} library - 'heroicons' | 'custom' (default 'heroicons')
 * @param {string} rootDir - Project root (default ROOT)
 * @returns {string|null} Full SVG markup or null if not found
 */
export function resolveIconToSvg(name, style = 'outline', library = 'heroicons', rootDir = ROOT) {
  if (!name || typeof name !== 'string') return null;
  const safeName = name.trim();
  if (!safeName) return null;

  if (library === 'heroicons') {
    const styleDir = style === 'solid' ? 'solid' : 'outline';
    const iconPath = path.join(rootDir, 'node_modules', 'heroicons', '24', styleDir, `${safeName}.svg`);
    if (fs.existsSync(iconPath)) {
      try {
        return fs.readFileSync(iconPath, 'utf-8').replace(/\s+/g, ' ').trim();
      } catch (_) {
        return null;
      }
    }
  }

  const publicPath = path.join(rootDir, 'public', `${safeName}.svg`);
  if (fs.existsSync(publicPath)) {
    try {
      return fs.readFileSync(publicPath, 'utf-8').replace(/\s+/g, ' ').trim();
    } catch (_) {
      return null;
    }
  }

  return null;
}

/**
 * Resolve a list of icon descriptors to a map of name -> SVG string.
 * Deduplicates by (name, style) so each file is read at most once.
 * @param {{ name: string, style?: string, library?: string }[]} descriptors
 * @param {string} rootDir - Project root
 * @returns {Record<string, string>} { "information-circle": "<svg>...</svg>", ... }
 */
export function resolveIconsToMap(descriptors, rootDir = ROOT) {
  const seen = new Set();
  const out = {};
  for (const d of descriptors) {
    const name = d?.name ?? d?.icon;
    if (!name) continue;
    const style = d?.style === 'solid' ? 'solid' : 'outline';
    const library = d?.library || 'heroicons';
    const key = `${name}:${style}:${library}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const svg = resolveIconToSvg(name, style, library, rootDir);
    if (svg) out[name] = svg;
  }
  return out;
}
