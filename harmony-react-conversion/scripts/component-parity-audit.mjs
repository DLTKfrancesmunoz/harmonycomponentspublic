#!/usr/bin/env node
/**
 * Component parity audit: compare each converted React component to its Astro source.
 * Output: report with Component, Check, Status, Details.
 * Run from repo root: node scripts/component-parity-audit.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HARMONY = path.join(ROOT, 'node_modules', '@deltek', 'harmony-components');
const REACT_HARMONY = path.join(ROOT, 'src', 'components', 'harmony');
const STYLES = path.join(HARMONY, 'src', 'styles');

const CHECKS = ['Props', 'Scoped styles', 'Theme behavior', 'Dark mode', 'Behavior scripts', 'Icons'];

// --- Helpers ---
function readSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function getReactComponents() {
  const names = fs.readdirSync(REACT_HARMONY, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.tsx'))
    .map((d) => d.name.replace(/\.tsx$/, ''));
  return names.sort();
}

function getAstroPath(name) {
  if (name === 'ShellLayout') {
    return path.join(HARMONY, 'src', 'layouts', 'ShellLayout.astro');
  }
  return path.join(HARMONY, 'src', 'components', 'ui', `${name}.astro`);
}

/** Count CSS rule blocks: each { } block (including inside @media) */
function countCssRuleBlocks(css) {
  if (!css || !css.trim()) return 0;
  let n = 0;
  let depth = 0;
  let inBlock = false;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') {
      depth++;
      if (depth === 1) n++;
    } else if (c === '}') {
      depth--;
    }
  }
  return n;
}

/** Extract Astro frontmatter (between --- and ---) */
function getAstroFrontmatter(astroContent) {
  const match = astroContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

/** Extract Astro template (after second ---) and script/style */
function getAstroTemplate(astroContent) {
  const after = astroContent.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
  return after;
}

function getAstroStyleBlock(astroContent) {
  const match = astroContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return match ? match[1].trim() : null;
}

function getAstroScriptBlock(astroContent) {
  const match = astroContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return match ? match[1].trim() : null;
}

/** Astro Props: top-level prop names only; extract only the Props interface body (balanced braces), then strip comments and nested type bodies */
function getAstroPropNames(astroContent) {
  const front = getAstroFrontmatter(astroContent);
  const startMatch = front.match(/export\s+interface\s+Props\s*\{/);
  if (!startMatch) return [];
  const startIdx = startMatch.index + startMatch[0].length;
  let depth = 1;
  let endIdx = startIdx;
  for (let i = startIdx; i < front.length && depth > 0; i++) {
    if (front[i] === '{') depth++;
    else if (front[i] === '}') depth--;
    endIdx = i;
  }
  let body = front.slice(startIdx, depth === 0 ? endIdx : front.length)
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  while (body.includes('{')) {
    const next = body.replace(/\{[^{}]*\}/g, '');
    if (next === body) break;
    body = next;
  }
  const names = [];
  const re = /(\w+)(?:\?)?\s*:/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    if (name === 'key' && /\[key\s*:\s*string\]/.test(body)) continue;
    names.push(name);
  }
  return names;
}

/** React: prop names from interface *Props and function destructured params */
function getReactPropNames(reactContent, componentName) {
  const names = new Set();
  const ifaceRe = new RegExp(`(?:export\\s+)?interface\\s+(?:${componentName}Props|\\w+Props)\\s*\\{([^}]+)\\}`, 'g');
  let m;
  while ((m = ifaceRe.exec(reactContent)) !== null) {
    const body = m[1];
    const re = /(\w+)(?:\?)?\s*:/g;
    let n;
    while ((n = re.exec(body)) !== null) names.add(n[1]);
  }
  const funcMatch = reactContent.match(new RegExp(`(?:export\\s+)?function\\s+${componentName}\\s*\\(([^)]*)\\)`, 's'));
  if (funcMatch) {
    const paramStr = funcMatch[1];
    const destructureMatch = paramStr.match(/\{([^}]+)\}/);
    if (destructureMatch) {
      destructureMatch[1].split(',').forEach((part) => {
        const key = part.trim().split(/[\s=:]/)[0].replace(/\.\.\./, '');
        if (key) names.add(key);
      });
    } else {
      paramStr.split(',').forEach((s) => {
        const p = s.trim().split(/[\s=:]/)[0];
        if (p) names.add(p);
      });
    }
  }
  return Array.from(names);
}

/** Astro prop name to React equivalent */
function normalizeAstroPropForReact(name) {
  if (name === 'class') return 'className';
  if (name === 'for') return 'htmlFor';
  return name;
}

/** Icon names used in Astro template */
function getAstroIconNames(astroContent) {
  const template = getAstroTemplate(astroContent);
  const names = [];
  const re = /<Icon\s+[^>]*name=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(template)) !== null) names.push(m[1]);
  const re2 = /Icon\s+name=["']([^"']+)["']/g;
  while ((m = re2.exec(astroContent)) !== null) names.push(m[1]);
  return [...new Set(names)];
}

/** Resolved icon names: PPM manifest + FALLBACK_SVG from Icon.tsx */
function getResolvedIconNames() {
  const manifestPath = path.join(HARMONY, 'src', 'data', 'icon-manifest.json');
  let ppm = {};
  try {
    const raw = JSON.parse(readSafe(manifestPath));
    ppm = raw.ppm || {};
  } catch (_) {}
  const iconTsx = readSafe(path.join(REACT_HARMONY, 'Icon.tsx'));
  const fallbackKeys = new Set(Object.keys(ppm));
  const fallbackStart = iconTsx.indexOf('FALLBACK_SVG');
  if (fallbackStart >= 0) {
    const slice = iconTsx.slice(fallbackStart, fallbackStart + 8000);
    const keyRe = /['"]([a-z0-9-]+)['"]\s*:/g;
    let k;
    while ((k = keyRe.exec(slice)) !== null) fallbackKeys.add(k[1]);
    const unquotedRe = /(?:^|[\s,])([a-z][a-z0-9-]*)\s*:/gm;
    while ((k = unquotedRe.exec(slice)) !== null) fallbackKeys.add(k[1]);
  }
  return fallbackKeys;
}

/** Component root class from Astro (first class in template like 'accordion', 'btn') */
function getComponentRootClasses(astroContent) {
  const template = getAstroTemplate(astroContent);
  const classes = new Set();
  // e.g. ['accordion', className] or class="accordion" or class={`accordion__item ...
  const listMatch = template.match(/\[\s*['"]([a-z][a-z0-9_-]+)['"]/);
  if (listMatch) classes.add(listMatch[1]);
  const re = /class=["']([^"']+)["']|class=\{[^}]*\}/g;
  let m;
  while ((m = re.exec(template)) !== null) {
    const c = m[1] || (m[0].match(/['"]([a-z][a-z0-9_-]+)['"]/) || [])[1];
    if (c) {
      const first = c.split(/\s+/)[0];
      if (first && !/__/.test(first)) classes.add(first);
    }
  }
  const backtickMatch = template.match(/class=\{[^}]*?['"`]([a-z][a-z0-9_-]+)['"`]/);
  if (backtickMatch) classes.add(backtickMatch[1]);
  return Array.from(classes);
}

/** Whether package CSS has any html.dark / theme-*.dark (app imports it in main.tsx) */
function packageHasDarkRules() {
  const componentsCss = readSafe(path.join(STYLES, 'components.css'));
  const tokensCss = readSafe(path.join(STYLES, 'tokens.css'));
  return /html\.dark|html\.theme-[^\s.]+\.dark/.test(componentsCss + tokensCss);
}

// --- Check implementations ---
function checkProps(name, astroContent, reactContent) {
  const astroProps = getAstroPropNames(astroContent);
  const reactProps = getReactPropNames(reactContent, name);
  const reactSet = new Set(reactProps);
  const missing = astroProps.filter((p) => !reactSet.has(normalizeAstroPropForReact(p)));
  if (missing.length) {
    return { status: 'fail', details: `Astro props missing in React: ${missing.join(', ')}` };
  }
  return { status: 'pass', details: '—' };
}

function checkScopedStyles(name, astroContent, reactCssContent) {
  const astroStyle = getAstroStyleBlock(astroContent);
  if (astroStyle) {
    const astroCount = countCssRuleBlocks(astroStyle);
    const reactCount = countCssRuleBlocks(reactCssContent);
    if (reactCount < astroCount) {
      return { status: 'fail', details: `Astro style rules: ${astroCount}, React CSS rules: ${reactCount}` };
    }
    return { status: 'pass', details: `Astro ${astroCount} rules, React ${reactCount} rules` };
  }
  const rootClasses = getComponentRootClasses(astroContent);
  if (rootClasses.length === 0) {
    return { status: 'pass', details: 'Astro no style block; app imports package CSS' };
  }
  const componentsCss = readSafe(path.join(STYLES, 'components.css'));
  const layoutCss = readSafe(path.join(STYLES, 'layout.css'));
  const hasInPackage = rootClasses.some((c) => componentsCss.includes(`.${c}`) || layoutCss.includes(`.${c}`));
  if (hasInPackage) {
    return { status: 'pass', details: 'Astro no style; component rules in package CSS (app imports it)' };
  }
  return { status: 'pass', details: 'Astro no style block' };
}

function checkThemeBehavior(astroContent, reactContent) {
  const themeSelectors = /theme-cp|theme-vp|theme-ppm|theme-maconomy|\.theme-/;
  const astroHas = themeSelectors.test(astroContent);
  const reactHas = themeSelectors.test(reactContent) || /\btheme-|data-theme/.test(reactContent);
  if (astroHas && !reactHas) {
    return { status: 'fail', details: 'Astro has theme-conditional logic; React may be missing equivalent' };
  }
  return { status: 'pass', details: '—' };
}

function checkDarkMode(name, astroContent, reactCssContent) {
  const astroStyle = getAstroStyleBlock(astroContent);
  if (astroStyle && (astroStyle.includes('html.dark') || astroStyle.includes('html.theme-'))) {
    const reactHasDark = reactCssContent && (reactCssContent.includes('html.dark') || reactCssContent.includes('html.theme-'));
    if (!reactHasDark) {
      return { status: 'fail', details: 'Astro <style> has html.dark/html.theme-* rules; React CSS should include them' };
    }
  }
  if (packageHasDarkRules()) {
    return { status: 'pass', details: 'App imports package CSS; dark rules present' };
  }
  return { status: 'pass', details: '—' };
}

function checkBehaviorScripts(astroContent, reactContent) {
  const script = getAstroScriptBlock(astroContent);
  if (!script || script.trim().length < 20) {
    return { status: 'pass', details: '—' };
  }
  const hasClick = /addEventListener\s*\(\s*['"]click|\.click|onClick|onclick/i.test(script);
  const reactHasHandler = /onClick|useState|useReducer|handleClick|on[A-Z]/.test(reactContent);
  if (hasClick && !reactHasHandler) {
    return { status: 'fail', details: 'Astro has script with click/behavior; React should have equivalent state/handlers' };
  }
  return { status: 'pass', details: '—' };
}

function checkIcons(name, astroContent, resolvedIconNames) {
  const iconNames = getAstroIconNames(astroContent);
  if (iconNames.length === 0) {
    return { status: 'pass', details: '—' };
  }
  const unresolved = iconNames.filter((n) => !resolvedIconNames.has(n));
  if (unresolved.length) {
    return { status: 'fail', details: `Icons not resolved in React Icon: ${unresolved.join(', ')}` };
  }
  return { status: 'pass', details: '—' };
}

// --- Main ---
function runAudit() {
  const resolvedIcons = getResolvedIconNames();
  const components = getReactComponents();
  const rows = [];

  for (const name of components) {
    const astroPath = getAstroPath(name);
    const astroContent = readSafe(astroPath);
    const reactPath = path.join(REACT_HARMONY, `${name}.tsx`);
    const reactContent = readSafe(reactPath);
    const reactCssPath = path.join(REACT_HARMONY, `${name}.css`);
    const reactCssContent = readSafe(reactCssPath);

    if (!astroContent) {
      for (const check of CHECKS) {
        rows.push({ component: name, check: check, status: 'fail', details: 'Astro source not found' });
      }
      continue;
    }

    const results = [
      checkProps(name, astroContent, reactContent),
      checkScopedStyles(name, astroContent, reactCssContent),
      checkThemeBehavior(astroContent, reactContent),
      checkDarkMode(name, astroContent, reactCssContent),
      checkBehaviorScripts(astroContent, reactContent),
      checkIcons(name, astroContent, resolvedIcons),
    ];

    CHECKS.forEach((check, i) => {
      rows.push({
        component: name,
        check,
        status: results[i].status,
        details: results[i].details,
      });
    });
  }

  return rows;
}

function toMarkdownTable(rows) {
  const lines = [
    '| Component | Check | Status | Details |',
    '| --------- | ----- | ------ | ------- |',
    ...rows.map((r) => `| ${r.component} | ${r.check} | ${r.status} | ${r.details} |`),
  ];
  return lines.join('\n');
}

function summary(rows) {
  const byCheck = {};
  CHECKS.forEach((c) => { byCheck[c] = { pass: 0, fail: 0 }; });
  const failedComponents = new Set();
  for (const r of rows) {
    byCheck[r.check][r.status]++;
    if (r.status === 'fail') failedComponents.add(r.component);
  }
  const lines = [
    '## Summary by check',
    '',
    ...CHECKS.map((c) => `- **${c}**: ${byCheck[c].pass} pass, ${byCheck[c].fail} fail`),
    '',
    '## Components with any failure',
    failedComponents.size ? Array.from(failedComponents).sort().join(', ') : 'None',
  ];
  return lines.join('\n');
}

const rows = runAudit();
const table = toMarkdownTable(rows);
const summaryText = summary(rows);
const report = `# Component parity audit report

Generated by \`scripts/component-parity-audit.mjs\`

${summaryText}

## Full report

${table}
`;

const reportPath = path.join(ROOT, 'COMPONENT_PARITY_AUDIT_REPORT.md');
fs.writeFileSync(reportPath, report, 'utf8');
console.log('Report written to', reportPath);
console.log(summaryText);
