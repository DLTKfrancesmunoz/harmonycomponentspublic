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

/** Union-style props we snapshot as *Values arrays (variantValues, sizeValues, styleValues) */
const UNION_PROPS = ['variant', 'size', 'style'];

/**
 * Detect variant (and union) value add/remove per component
 */
function detectVariantChanges(currentSnapshot, previousSnapshot) {
  const changes = [];

  for (const currentComp of currentSnapshot.components) {
    const prevComp = previousSnapshot.components.find(p => p.name === currentComp.name);
    if (!prevComp) continue;

    for (const propName of UNION_PROPS) {
      const currentValues = currentComp[`${propName}Values`] || [];
      const prevValues = prevComp[`${propName}Values`] || [];

      for (const value of currentValues) {
        if (!prevValues.includes(value)) {
          changes.push({
            type: 'component',
            category: 'added',
            target: currentComp.name,
            change: 'variant_added',
            propName,
            variantName: value,
            breaking: false
          });
        }
      }
      for (const value of prevValues) {
        if (!currentValues.includes(value)) {
          changes.push({
            type: 'component',
            category: 'removed',
            target: currentComp.name,
            change: 'variant_removed',
            propName,
            variantName: value,
            breaking: true
          });
        }
      }
    }
  }

  return changes;
}

/**
 * Deep equality for props objects (keys and values)
 */
function propsEqual(a, b) {
  const keysA = Object.keys(a || {});
  const keysB = Object.keys(b || {});
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!(k in (b || {}))) return false;
    const va = a[k];
    const vb = b[k];
    if (typeof va === 'object' && va !== null && typeof vb === 'object' && vb !== null) {
      if (JSON.stringify(va) !== JSON.stringify(vb)) return false;
    } else if (va !== vb) return false;
  }
  return true;
}

/**
 * Compare union value arrays (order-independent)
 */
function unionValuesEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(v => setB.has(v));
}

/**
 * Detect implementation-only file changes (fileHash changed but props/variants unchanged)
 */
function detectFileModified(currentSnapshot, previousSnapshot) {
  const changes = [];
  const propAndVariantChangeTargets = new Set();

  // Collect targets that already have prop or variant changes (so we don't double-emit file_modified)
  // We'll run after detectPropsChanges and detectVariantChanges, so callers will merge arrays;
  // we need to know which components had those changes. So we need to compute prop/variant
  // changes ourselves here to decide if fileHash-only change is "implementation only".
  for (const currentComp of currentSnapshot.components) {
    const prevComp = previousSnapshot.components.find(p => p.name === currentComp.name);
    if (!prevComp) continue;

    const propsChanged = !propsEqual(currentComp.props, prevComp.props);
    let unionChanged = false;
    for (const propName of UNION_PROPS) {
      const key = `${propName}Values`;
      if (!unionValuesEqual(currentComp[key], prevComp[key])) {
        unionChanged = true;
        break;
      }
    }
    if (propsChanged || unionChanged) {
      propAndVariantChangeTargets.add(currentComp.name);
    }
  }

  for (const currentComp of currentSnapshot.components) {
    const prevComp = previousSnapshot.components.find(p => p.name === currentComp.name);
    if (!prevComp) continue;
    if (propAndVariantChangeTargets.has(currentComp.name)) continue;
    if (currentComp.fileHash === prevComp.fileHash) continue;

    changes.push({
      type: 'component',
      category: 'changed',
      target: currentComp.name,
      change: 'file_modified',
      filePath: currentComp.filePath,
      breaking: false
    });
  }

  return changes;
}

/**
 * Detect style (CSS) file changes.
 * Only emits an entry when a previously tracked style file's content changed
 * (not on first run when previous styles snapshot is empty).
 */
function detectStyleChanges(currentSnapshot, previousSnapshot) {
  const changes = [];
  const current = currentSnapshot.styles || {};
  const previous = previousSnapshot.styles || {};
  const changedFiles = [];

  const allFiles = new Set([...Object.keys(current), ...Object.keys(previous)]);

  for (const file of allFiles) {
    const curr = current[file];
    const prev = previous[file];

    if (!curr && prev) {
      changedFiles.push(prev.filePath || file);
    } else if (curr && !prev) {
      changedFiles.push(curr.filePath || file);
    } else if (curr && prev && curr.hash !== prev.hash) {
      changedFiles.push(curr.filePath || file);
    }
  }

  // Only emit when we have a previous styles snapshot (so we don't add noise on first run)
  const hadPreviousStyles = Object.keys(previous).length > 0;
  if (hadPreviousStyles && changedFiles.length > 0) {
    changes.push({
      type: 'system',
      category: 'changed',
      target: 'Styles',
      change: 'styles_modified',
      filePath: changedFiles[0],
      files: changedFiles,
      breaking: false
    });
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
    ...detectVariantChanges(currentSnapshot, previousSnapshot),
    ...detectFileModified(currentSnapshot, previousSnapshot),
    ...detectStyleChanges(currentSnapshot, previousSnapshot),
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
