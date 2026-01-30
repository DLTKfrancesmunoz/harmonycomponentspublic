#!/usr/bin/env node
/**
 * Description templates for changelog entries
 * Generates user-friendly descriptions from detected changes
 */

export const templates = {
  component: {
    added: {
      file_added: (target) =>
        `New ${target} component added to the design system`,
      prop_added: (target, propName, propType) =>
        `Add ${propName} prop to ${target} component (${propType})`,
      variant_added: (target, propName, variantName) =>
        `Add ${propName} '${variantName}' to ${target}`
    },
    changed: {
      prop_type_changed: (target, propName, before, after) =>
        `Update ${propName} type in ${target} from ${before} to ${after}`,
      prop_default_changed: (target, propName, before, after) => {
        if (before === 'null' || !before) {
          return `Add default value for ${propName} in ${target}: ${after}`;
        }
        if (after === 'null' || !after) {
          return `Remove default value for ${propName} in ${target}`;
        }
        return `Change ${propName} default value in ${target} from ${before} to ${after}`;
      },
      file_modified: (target) =>
        `Update ${target} component implementation`
    },
    removed: {
      file_removed: (target) =>
        `Remove ${target} component`,
      prop_removed: (target, propName) =>
        `Remove ${propName} prop from ${target} component`,
      variant_removed: (target, propName, variantName) =>
        `Remove ${propName} '${variantName}' from ${target}`
    }
  },
  system: {
    changed: {
      styles_modified: (target) =>
        `Update design system styles (e.g. components.css, layout.css)`
    }
  },
  token: {
    added: (target, path) =>
      `Add ${path} to ${target} tokens`,
    changed: (target, path, before, after) => {
      // Format values based on token type
      const formatValue = (val) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return `${val}px`;
        return JSON.stringify(val);
      };

      return `Update ${path} in ${target}: ${formatValue(before)} → ${formatValue(after)}`;
    },
    removed: (target, path) =>
      `Remove ${path} from ${target} tokens`
  }
};

/**
 * Generate user-friendly description from change object
 */
export function generateDescription(change) {
  const { type, category, change: changeType, target } = change;

  // Get the appropriate template
  const categoryTemplates = templates[type]?.[category];
  if (!categoryTemplates) {
    return `${category} in ${target}`;
  }

  // Call template with appropriate arguments
  try {
    if (type === 'component') {
      // For components, templates are nested by changeType
      const template = categoryTemplates[changeType];
      if (!template) {
        return `${category} in ${target}`;
      }

      if (changeType === 'file_added' || changeType === 'file_removed' || changeType === 'file_modified') {
        return template(target);
      }

      if (changeType === 'prop_added') {
        return template(target, change.propName, change.propType);
      }

      if (changeType === 'prop_type_changed') {
        return template(target, change.propName, change.before, change.after);
      }

      if (changeType === 'prop_default_changed') {
        return template(target, change.propName, change.before, change.after);
      }

      if (changeType === 'prop_removed') {
        return template(target, change.propName);
      }

      if (changeType === 'variant_added' || changeType === 'variant_removed') {
        return template(target, change.propName, change.variantName);
      }
    }

    if (type === 'system') {
      const template = categoryTemplates?.[changeType];
      if (template && changeType === 'styles_modified') {
        return template(target);
      }
      return `${category} in ${target}`;
    }

    if (type === 'token') {
      // For tokens, categoryTemplates is already the function
      const template = categoryTemplates;
      if (typeof template !== 'function') {
        return `${category} in ${target}`;
      }

      if (category === 'added' || category === 'removed') {
        return template(target, change.path);
      }

      if (category === 'changed') {
        return template(target, change.path, change.before, change.after);
      }
    }

    return `${category} in ${target}`;
  } catch (error) {
    console.warn(`Failed to generate description for ${target}:`, error.message);
    return `${category} in ${target}`;
  }
}

/**
 * Generate a concise title for changelog entry
 */
export function generateTitle(change) {
  const { type, category, target, propName } = change;

  if (propName) {
    return `${target}.${propName}`;
  }

  return target;
}
