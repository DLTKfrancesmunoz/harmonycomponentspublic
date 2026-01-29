#!/usr/bin/env node
/**
 * Quick sanity check that MCP generation produced expected output.
 * Used in CI after npm run generate:mcp-data.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buttonPath = path.join(rootDir, 'mcp-data/components/button.json');

const j = JSON.parse(fs.readFileSync(buttonPath, 'utf8'));
const variantType = j.props?.variant?.type || '';
if (!variantType.includes('dela')) {
  console.error('Verify failed: button.json props.variant.type missing "dela"');
  process.exit(1);
}
console.log('Verify OK: button.json has expected variant shape');
