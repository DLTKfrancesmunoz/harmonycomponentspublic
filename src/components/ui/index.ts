/**
 * Harmony Design System - UI Components
 * 
 * Export all reusable UI components for easy importing.
 * 
 * @example
 * import { Button, Card, Input } from '../components/ui';
 * 
 * // Or import individual components
 * import Button from '../components/ui/Button.astro';
 */

// Note: Astro components are imported directly from their .astro files
// This file serves as documentation of available components

export const components = {
  // Form Controls
  Button: 'Button.astro',
  ButtonGroup: 'ButtonGroup.astro',
  Input: 'Input.astro',
  Textarea: 'Textarea.astro',
  Checkbox: 'Checkbox.astro',
  RadioButton: 'RadioButton.astro',
  Toggle: 'Toggle.astro',
  Dropdown: 'Dropdown.astro',
  Label: 'Label.astro',
  
  // Display
  Card: 'Card.astro',
  Badge: 'Badge.astro',
  Chip: 'Chip.astro',
  Alert: 'Alert.astro',
  Tooltip: 'Tooltip.astro',
  ProgressBar: 'ProgressBar.astro',
  Spinner: 'Spinner.astro',
  
  // Navigation
  Link: 'Link.astro',
  Accordion: 'Accordion.astro',
  
  // Overlay
  Dialog: 'Dialog.astro',
} as const;

export type ComponentName = keyof typeof components;

// Component categories for documentation
export const componentCategories = {
  'Form Controls': [
    'Button',
    'ButtonGroup', 
    'Input',
    'Textarea',
    'Checkbox',
    'RadioButton',
    'Toggle',
    'Dropdown',
    'Label',
  ],
  'Display': [
    'Card',
    'Badge',
    'Chip',
    'Alert',
    'Tooltip',
    'ProgressBar',
    'Spinner',
  ],
  'Navigation': [
    'Link',
    'Accordion',
  ],
  'Overlay': [
    'Dialog',
  ],
} as const;

