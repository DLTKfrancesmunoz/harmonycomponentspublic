/**
 * Astro Component Parser
 * Uses @astrojs/compiler for AST-based parsing of .astro files
 */

import { parse } from '@astrojs/compiler';
import fs from 'fs';
import path from 'path';

/**
 * Parse an Astro component file and extract structured data
 * @param {string} filePath - Path to the .astro file
 * @param {Object} cssSpacingMap - Optional CSS spacing map for structure enhancement
 * @returns {Promise<Object>} Parsed component data
 */
export async function parseComponent(filePath, cssSpacingMap = null) {
  const source = fs.readFileSync(filePath, 'utf-8');
  const result = await parse(source, { position: false });
  const ast = result.ast; // parse() returns { ast: ... }

  // Extract basic data
  const imports = extractImports(ast);
  const props = extractProps(ast);
  const cssClasses = extractCSSClasses(ast);

  // Extract enhanced structure with spacing and slot locations
  const structure = extractDetailedStructure(ast, cssSpacingMap, props);

  // Extract slots with location and conditional information from structure
  const slots = extractEnhancedSlots(ast, structure);

  return {
    filePath,
    frontmatter: extractFrontmatter(ast),
    imports,
    props,
    slots,
    structure,
    cssClasses,
  };
}

/**
 * Extract frontmatter code from AST
 * @param {Object} ast - Parsed AST
 * @returns {string|null} Frontmatter code
 */
export function extractFrontmatter(ast) {
  // Direct approach: check children for frontmatter node
  if (ast.children && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      if (child.type === 'frontmatter') {
        return child.value;
      }
    }
  }

  return null;
}

/**
 * Extract import statements and their sources
 * @param {Object} ast - Parsed AST
 * @returns {Object} Map of imported names to their sources
 */
export function extractImports(ast) {
  const frontmatter = extractFrontmatter(ast);
  if (!frontmatter) return {};

  const imports = {};

  // Match import statements: import X from 'Y' or import { X } from 'Y'
  const importRegex = /import\s+(?:{[^}]+}|[\w]+|\*\s+as\s+[\w]+)\s+from\s+['"]([^'"]+)['"]/g;
  const matches = frontmatter.matchAll(importRegex);

  for (const match of matches) {
    const source = match[1];

    // Extract imported names
    const importStatement = match[0];
    const defaultImportMatch = importStatement.match(/import\s+([\w]+)\s+from/);
    const namedImportsMatch = importStatement.match(/import\s+{([^}]+)}\s+from/);
    const namespaceMatch = importStatement.match(/import\s+\*\s+as\s+([\w]+)\s+from/);

    if (defaultImportMatch) {
      const name = defaultImportMatch[1];
      imports[name] = source;
    } else if (namedImportsMatch) {
      const names = namedImportsMatch[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]);
      names.forEach(name => {
        imports[name] = source;
      });
    } else if (namespaceMatch) {
      const name = namespaceMatch[1];
      imports[name] = source;
    }
  }

  return imports;
}

/**
 * Extract dependencies (component imports only)
 * @param {Object} ast - Parsed AST
 * @returns {string[]} Array of component names
 */
export function extractDependencies(ast) {
  const imports = extractImports(ast);
  const dependencies = [];

  for (const [name, source] of Object.entries(imports)) {
    // Component imports are typically capitalized and from relative paths or ui folders
    if (/^[A-Z]/.test(name) && (source.startsWith('.') || source.includes('/ui/'))) {
      dependencies.push(name);
    }
  }

  return dependencies;
}

/**
 * Extract Props interface from frontmatter
 * @param {Object} ast - Parsed AST
 * @returns {Object} Props with type information
 */
export function extractProps(ast) {
  const frontmatter = extractFrontmatter(ast);
  if (!frontmatter) return {};

  const props = {};

  // Match interface Props { ... }
  const interfaceRegex = /interface\s+Props\s*\{([^}]+)\}/s;
  const interfaceMatch = frontmatter.match(interfaceRegex);

  if (!interfaceMatch) return props;

  const propsBody = interfaceMatch[1];

  // Match individual prop definitions: name?: type = default
  const propRegex = /(\w+)(\?)?:\s*([^;=]+)(?:=\s*([^;]+))?;?/g;
  const propMatches = propsBody.matchAll(propRegex);

  for (const match of propMatches) {
    const [, name, optional, type, defaultValue] = match;

    props[name] = {
      type: type.trim(),
      optional: !!optional,
      default: defaultValue ? defaultValue.trim() : null,
    };
  }

  return props;
}

/**
 * Extract slots from template
 * @param {Object} ast - Parsed AST
 * @returns {Object} Map of slot names to their info
 */
export function extractSlots(ast) {
  const slots = {};

  // Recursively traverse the tree
  function traverse(node) {
    if (!node) return;

    // Check for <slot> elements
    if (node.type === 'element' && node.name === 'slot') {
      const slotName = node.attributes?.find(attr => attr.name === 'name')?.value || 'default';

      slots[slotName] = {
        name: slotName,
        required: slotName === 'default', // Default slot is typically required
      };
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return slots;
}

/**
 * Extract DOM structure from template
 * @param {Object} ast - Parsed AST
 * @returns {Object} Structure hierarchy
 */
export function extractStructure(ast) {
  const structure = {
    root: null,
    children: [],
  };

  let isFirstElement = true;

  function traverse(node) {
    if (!node) return;

    // Only process elements in the template (not frontmatter)
    if (node.type === 'element' || node.type === 'component') {
      const elementData = {
        element: node.name,
        attributes: node.attributes || [],
        children: [],
      };

      // Extract class attribute
      const classAttr = node.attributes?.find(attr => attr.name === 'class');
      if (classAttr) {
        elementData.class = classAttr.value;
        elementData.classKind = classAttr.kind; // 'quoted' | 'expression' | etc.
      }

      // First element is typically the root
      if (isFirstElement && node.type === 'element') {
        structure.root = elementData;
        isFirstElement = false;
      } else {
        structure.children.push(elementData);
      }
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return structure;
}

/**
 * Extract conditional expressions from template
 * @param {Object} ast - Parsed AST
 * @returns {Array} Array of conditional expressions
 */
export function extractConditionals(ast) {
  const conditionals = [];

  function traverse(node) {
    if (!node) return;

    // Expression nodes contain conditional rendering logic
    if (node.type === 'expression') {
      const expression = node.value?.trim();

      // Look for patterns like: {condition && <element>} or {condition ? <a> : <b>}
      if (expression && (expression.includes('&&') || expression.includes('?'))) {
        conditionals.push({
          expression,
          type: expression.includes('?') ? 'ternary' : 'logical-and',
        });
      }
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return conditionals;
}

/**
 * Extract all CSS classes used in template
 * @param {Object} ast - Parsed AST
 * @returns {string[]} Array of unique class names
 */
export function extractCSSClasses(ast) {
  const classes = new Set();

  function traverse(node) {
    if (!node) return;

    // Check elements and components for class attributes
    if ((node.type === 'element' || node.type === 'component') && node.attributes) {
      const classAttr = node.attributes.find(attr => attr.name === 'class');

      if (classAttr && classAttr.kind === 'quoted') {
        // Static classes - split and add each
        const classList = classAttr.value.split(/\s+/).filter(Boolean);
        classList.forEach(cls => classes.add(cls));
      } else if (classAttr && classAttr.kind === 'expression') {
        // Dynamic classes - try to extract static parts
        // This is best effort for common patterns
        const expression = classAttr.value;

        // Extract strings from template literals: `class ${var} other-class`
        const stringMatches = expression.matchAll(/['"`]([^'"`]+)['"`]/g);
        for (const match of stringMatches) {
          const classList = match[1].split(/\s+/).filter(Boolean);
          classList.forEach(cls => classes.add(cls));
        }
      }
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return Array.from(classes);
}

/**
 * Find parent element class for a given node (useful for slot location)
 * @param {Object} ast - Parsed AST
 * @param {Object} targetNode - The node to find parent for
 * @returns {string|null} Parent element's class
 */
export function findParentElementClass(ast, targetNode) {
  let parentClass = null;

  // This is a simplified version - full implementation would need
  // to track parent context during walk
  walk(ast, (node, context) => {
    if (node === targetNode && context.parent) {
      const classAttr = context.parent.attributes?.find(attr => attr.name === 'class');
      if (classAttr && classAttr.kind === 'quoted') {
        parentClass = classAttr.value;
      }
    }
  });

  return parentClass;
}

/**
 * Extract description from file comments
 * @param {string} filePath - Path to the file
 * @returns {string|null} Description from comments
 */
export function extractDescription(filePath) {
  const source = fs.readFileSync(filePath, 'utf-8');

  // Look for JSDoc-style comments at the top of the file or frontmatter
  const jsdocMatch = source.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
  if (jsdocMatch) {
    return jsdocMatch[1].trim();
  }

  // Look for single-line comment at the top
  const commentMatch = source.match(/^\/\/\s*([^\n]+)/);
  if (commentMatch) {
    return commentMatch[1].trim();
  }

  return null;
}

/**
 * Get component name from file path
 * @param {string} filePath - Path to the component file
 * @returns {string} Component name
 */
export function getComponentName(filePath) {
  return path.basename(filePath, '.astro');
}

/**
 * Load CSS spacing values from components.css
 * @param {string} cssPath - Path to the CSS file (defaults to src/styles/components.css)
 * @returns {Object} Map of CSS selectors to their spacing values
 */
export function loadCssSpacing(cssPath = null) {
  if (!cssPath) {
    // Auto-detect CSS path relative to project root
    const projectRoot = process.cwd();
    cssPath = path.join(projectRoot, 'src/styles/components.css');
  }

  if (!fs.existsSync(cssPath)) {
    console.warn(`CSS file not found at ${cssPath}, spacing data will not be available`);
    return {};
  }

  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const spacingMap = {};

  // Match CSS rules with padding or margin
  // Pattern: .class-name { ... padding: value; ... margin: value; ... }
  const ruleRegex = /([.#][\w-]+(?:\s*,\s*[.#][\w-]+)*)\s*\{([^}]+)\}/g;

  for (const match of cssContent.matchAll(ruleRegex)) {
    const selectors = match[1].split(',').map(s => s.trim());
    const ruleBody = match[2];

    // Extract padding and margin
    const paddingMatch = ruleBody.match(/padding:\s*([^;]+);/);
    const marginMatch = ruleBody.match(/margin:\s*([^;]+);/);

    if (paddingMatch || marginMatch) {
      const spacing = {
        padding: paddingMatch ? paddingMatch[1].trim() : '0',
        margin: marginMatch ? marginMatch[1].trim() : '0',
      };

      selectors.forEach(selector => {
        spacingMap[selector] = spacing;
      });
    }
  }

  return spacingMap;
}

/**
 * Extract enhanced slots with location and conditional information
 * @param {Object} ast - Parsed AST
 * @param {Object} structure - Component structure (from extractDetailedStructure)
 * @returns {Object} Map of slot names to enhanced slot info
 */
export function extractEnhancedSlots(ast, structure) {
  const slots = {};

  // Helper to find slot info from structure
  function findSlotInStructure(slotName, node) {
    if (!node) return null;

    // Check if this node is a slot
    if (node.element === 'slot' && node.slotName === slotName) {
      return node;
    }

    // Check children recursively
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findSlotInStructure(slotName, child);
        if (found) return found;
      }
    }

    return null;
  }

  // Helper to find parent container for a slot
  function findSlotParent(slotName, node, parent = null) {
    if (!node) return null;

    // Check if this node contains the slot directly
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child.element === 'slot' && child.slotName === slotName) {
          return node;
        }
      }

      // Recurse into children
      for (const child of node.children) {
        const found = findSlotParent(slotName, child, node);
        if (found) return found;
      }
    }

    return null;
  }

  // First pass: collect all slots from AST
  function traverse(node, parentConditional = null) {
    if (!node) return;

    // Track conditional context
    let currentConditional = parentConditional;
    if (node.type === 'expression') {
      const expression = node.value?.trim();
      if (expression && (expression.includes('&&') || expression.includes('?') || expression.includes('Astro.slots.has'))) {
        currentConditional = expression;
      }
    }

    // Check for <slot> elements
    if (node.type === 'element' && node.name === 'slot') {
      const slotName = node.attributes?.find(attr => attr.name === 'name')?.value || 'default';

      // Find parent container from structure
      let location = null;
      let parentNode = null;

      if (structure) {
        // Search in root
        if (structure.root) {
          parentNode = findSlotParent(slotName, structure.root);
        }

        // Search in children
        if (!parentNode && structure.children) {
          for (const child of structure.children) {
            parentNode = findSlotParent(slotName, child);
            if (parentNode) break;
          }
        }

        // Extract location from parent class
        if (parentNode && parentNode.class) {
          // Extract first class name as location
          const classes = parentNode.class.split(/\s+/).filter(Boolean);
          location = classes[0] || null;
        }
      }

      slots[slotName] = {
        name: slotName,
        required: slotName === 'default',
        location,
        description: null, // Could be enhanced by parsing comments
        conditional: currentConditional,
      };
    }

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, currentConditional);
      }
    }
  }

  traverse(ast);
  return slots;
}

/**
 * Extract detailed DOM structure with spacing and hierarchy
 * @param {Object} ast - Parsed AST
 * @param {Object} cssSpacingMap - CSS spacing map from loadCssSpacing
 * @param {Object} props - Component props (for modifier class detection)
 * @returns {Object} Detailed structure hierarchy
 */
export function extractDetailedStructure(ast, cssSpacingMap = null, props = {}) {
  const structure = {
    root: null,
    children: [],
  };

  let isFirstElement = true;

  // Helper to get spacing for a class
  function getSpacing(className) {
    if (!cssSpacingMap || !className) {
      return { padding: '0', margin: '0' };
    }

    // Try with dot prefix
    const spacing = cssSpacingMap['.' + className];
    if (spacing) return { ...spacing };

    // Try exact match (in case it already has dot)
    const exactMatch = cssSpacingMap[className];
    if (exactMatch) return { ...exactMatch };

    return { padding: '0', margin: '0' };
  }

  // Helper to extract class information
  function extractClassInfo(node) {
    const classAttr = node.attributes?.find(attr => attr.name === 'class');
    if (!classAttr) return { class: null, classList: [] };

    let classList = [];
    let classValue = null;

    if (classAttr.kind === 'quoted') {
      // Static classes
      classValue = classAttr.value;
      classList = classValue.split(/\s+/).filter(Boolean);
    } else if (classAttr.kind === 'expression') {
      // Dynamic classes - extract what we can
      classValue = classAttr.value;

      // Try to extract static class strings
      const stringMatches = classAttr.value.matchAll(/['"`]([^'"`]+)['"`]/g);
      for (const match of stringMatches) {
        const classes = match[1].split(/\s+/).filter(Boolean);
        classList.push(...classes);
      }
    }

    return { class: classValue, classList };
  }

  // Helper to detect modifier classes from props
  function detectModifierClasses(node, props) {
    const modifierClasses = {};

    // Look for dynamic class construction patterns
    const classAttr = node.attributes?.find(attr => attr.name === 'class');
    if (!classAttr || classAttr.kind !== 'expression') return modifierClasses;

    const expression = classAttr.value;

    // Pattern: propName && 'class-name'
    const propClassRegex = /(\w+)\s*&&\s*['"]([^'"]+)['"]/g;
    for (const match of expression.matchAll(propClassRegex)) {
      const [, propName, className] = match;
      if (props[propName]) {
        modifierClasses[propName] = className;
      }
    }

    return modifierClasses;
  }

  // Helper to extract conditional expression wrapping a node
  function extractConditional(parentNode) {
    // Check if parent has expression children that wrap this element
    if (!parentNode || !parentNode.children) return null;

    for (const child of parentNode.children) {
      if (child.type === 'expression') {
        const expr = child.value?.trim();
        if (expr && (expr.includes('&&') || expr.includes('?') || expr.includes('Astro.slots.has'))) {
          return expr;
        }
      }
    }

    return null;
  }

  function traverse(node, parent = null, depth = 0) {
    if (!node) return null;

    // Only process elements in the template (not frontmatter)
    if (node.type === 'element' || node.type === 'component') {
      const { class: classValue, classList } = extractClassInfo(node);

      const elementData = {
        element: node.name,
        class: classValue,
      };

      // Add spacing if we have a class
      if (classList.length > 0) {
        // Use first class for spacing lookup
        elementData.spacing = getSpacing(classList[0]);
      } else {
        elementData.spacing = { padding: '0', margin: '0' };
      }

      // For root element, detect modifier classes
      if (isFirstElement && node.type === 'element') {
        const baseClass = classList.length > 0 ? classList[0] : null;
        elementData.baseClass = baseClass;
        elementData.modifierClasses = detectModifierClasses(node, props);

        structure.root = elementData;
        isFirstElement = false;

        // Process children of root
        if (node.children && Array.isArray(node.children)) {
          elementData.children = [];
          for (const child of node.children) {
            const childData = traverse(child, node, depth + 1);
            if (childData) {
              elementData.children.push(childData);
            }
          }
        }

        return null; // Root is already set
      }

      // Check for conditional rendering
      const conditional = extractConditionalFromParent(node, parent);
      if (conditional) {
        elementData.conditional = conditional;
      }

      // Check if this element contains a slot
      if (node.children && Array.isArray(node.children)) {
        elementData.children = [];

        for (const child of node.children) {
          if (child.type === 'element' && child.name === 'slot') {
            const slotName = child.attributes?.find(attr => attr.name === 'name')?.value || 'default';
            elementData.children.push({
              element: 'slot',
              slotName,
              class: null,
            });
          } else {
            const childData = traverse(child, node, depth + 1);
            if (childData) {
              elementData.children.push(childData);
            }
          }
        }
      }

      return elementData;
    }

    // For slot elements
    if (node.type === 'element' && node.name === 'slot') {
      const slotName = node.attributes?.find(attr => attr.name === 'name')?.value || 'default';
      return {
        element: 'slot',
        slotName,
        class: null,
      };
    }

    // For expression nodes, check if they wrap elements
    if (node.type === 'expression' && node.children && node.children.length > 0) {
      // Process children in the expression
      const results = [];
      for (const child of node.children) {
        const result = traverse(child, node, depth);
        if (result) results.push(result);
      }
      return results.length === 1 ? results[0] : null;
    }

    return null;
  }

  // Helper to extract conditional from parent expression
  function extractConditionalFromParent(node, parent) {
    if (!parent) return null;

    // Check if parent is an expression
    if (parent.type === 'expression') {
      const expr = parent.value?.trim();
      if (expr && (expr.includes('&&') || expr.includes('?') || expr.includes('Astro.slots.has'))) {
        // Extract the condition part (before && or ?)
        const condMatch = expr.match(/^(.+?)(?:\s*&&|\s*\?)/);
        return condMatch ? condMatch[1].trim() : expr;
      }
    }

    // Check if we're inside an expression that contains conditional logic
    if (parent.children) {
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child === node && i > 0) {
          const prevSibling = parent.children[i - 1];
          if (prevSibling.type === 'expression') {
            const expr = prevSibling.value?.trim();
            if (expr && (expr.includes('&&') || expr.includes('?'))) {
              return expr;
            }
          }
        }
      }
    }

    return null;
  }

  // Start traversal from AST root
  if (ast.children && Array.isArray(ast.children)) {
    for (const child of ast.children) {
      // Skip frontmatter
      if (child.type === 'frontmatter') continue;

      if (isFirstElement) {
        // Process root
        traverse(child, null, 0);
      } else {
        // Process as child
        const childData = traverse(child, ast, 0);
        if (childData) {
          structure.children.push(childData);
        }
      }
    }
  }

  return structure;
}

export default {
  parseComponent,
  extractFrontmatter,
  extractImports,
  extractDependencies,
  extractProps,
  extractSlots,
  extractStructure,
  extractConditionals,
  extractCSSClasses,
  extractDescription,
  getComponentName,
  loadCssSpacing,
  extractEnhancedSlots,
  extractDetailedStructure,
};
