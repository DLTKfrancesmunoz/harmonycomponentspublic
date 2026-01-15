#!/usr/bin/env node
/**
 * Detect changes between snapshots
 * Compares current vs previous snapshot to find component and token changes
 */

import { deepDiff } from './utils.js';

/**
 * Detect new components
 */
function detectNewComponents(currentSnapshot, previousSnapshot) {
  const newComponents = currentSnapshot.components.filter(
    c => !previousSnapshot.components.find(p => p.name === c.name)
  );

  return newComponents.map(c => ({
    type: 'component',
    category: 'added',
    target: c.name,
    change: 'file_added',
    filePath: c.filePath,
    breaking: false
  }));
}

/**
 * Detect removed components
 */
function detectRemovedComponents(currentSnapshot, previousSnapshot) {
  const removedComponents = previousSnapshot.components.filter(
    p => !currentSnapshot.components.find(c => c.name === p.name)
  );

  return removedComponents.map(p => ({
    type: 'component',
    category: 'removed',
    target: p.name,
    change: 'file_removed',
    filePath: p.filePath,
    breaking: true // Removing a component is always breaking
  }));
}

/**
 * Detect props changes within components
 */
function detectPropsChanges(currentSnapshot, previousSnapshot) {
  const changes = [];

  for (const currentComp of currentSnapshot.components) {
    const prevComp = previousSnapshot.components.find(p => p.name === currentComp.name);
    if (!prevComp) continue;

    // Compare props
    for (const [propName, propData] of Object.entries(currentComp.props)) {
      const prevProp = prevComp.props[propName];

      if (!prevProp) {
        // New prop added
        const isBreaking = !propData.optional && !propData.default;
        changes.push({
          type: 'component',
          category: 'added',
          target: currentComp.name,
          change: 'prop_added',
          propName,
          propType: propData.type,
          breaking: isBreaking
        });
      } else if (prevProp.type !== propData.type) {
        // Prop type changed - usually breaking
        changes.push({
          type: 'component',
          category: 'changed',
          target: currentComp.name,
          change: 'prop_type_changed',
          propName,
          before: prevProp.type,
          after: propData.type,
          breaking: true
        });
      } else if (prevProp.default !== propData.default) {
        // Default value changed
        changes.push({
          type: 'component',
          category: 'changed',
          target: currentComp.name,
          change: 'prop_default_changed',
          propName,
          before: prevProp.default,
          after: propData.default,
          breaking: false
        });
      }
    }

    // Check for removed props - always breaking
    for (const prevPropName of Object.keys(prevComp.props)) {
      if (!currentComp.props[prevPropName]) {
        changes.push({
          type: 'component',
          category: 'removed',
          target: currentComp.name,
          change: 'prop_removed',
          propName: prevPropName,
          breaking: true
        });
      }
    }
  }

  return changes;
}

/**
 * Detect token changes
 */
function detectTokenChanges(currentSnapshot, previousSnapshot) {
  const changes = [];

  for (const tokenFile of ['colors', 'spacing', 'typography', 'elevations']) {
    const current = currentSnapshot.tokens[tokenFile];
    const previous = previousSnapshot.tokens[tokenFile];

    if (!current || !previous) continue;

    // If hashes are the same, no changes
    if (current.hash === previous.hash) continue;

    // Deep diff to find specific changes
    const diff = deepDiff(previous.data, current.data);

    for (const change of diff) {
      const pathString = change.path.join('.');

      changes.push({
        type: 'token',
        category: change.type, // 'added', 'changed', 'removed'
        target: tokenFile,
        change: `token_${change.type}`,
        path: pathString,
        before: change.oldValue,
        after: change.newValue,
        breaking: false // Token changes are usually not breaking
      });
    }
  }

  return changes;
}

/**
 * Main function to detect all changes
 */
export function detectChanges(currentSnapshot, previousSnapshot) {
  console.log('🔎 Detecting changes...\n');

  const changes = [
    ...detectNewComponents(currentSnapshot, previousSnapshot),
    ...detectRemovedComponents(currentSnapshot, previousSnapshot),
    ...detectPropsChanges(currentSnapshot, previousSnapshot),
    ...detectTokenChanges(currentSnapshot, previousSnapshot)
  ];

  console.log(`Found ${changes.length} changes:`);
  changes.forEach(c => {
    const breaking = c.breaking ? ' [BREAKING]' : '';
    console.log(`  - ${c.category}: ${c.target}${breaking}`);
  });

  return changes;
}

// Run directly if executed as script
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script should be run as part of the automation pipeline.');
  process.exit(0);
}
