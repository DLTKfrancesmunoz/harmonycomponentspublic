/**
 * Harmony Design System - Token Exports
 * 
 * This file provides TypeScript exports for all design tokens.
 * Import these for programmatic access to the design system.
 */

import colorsJson from './colors.json';
import spacingJson from './spacing.json';
import elevationsJson from './elevations.json';
import typographyJson from './typography.json';

export const colors = colorsJson;
export const spacing = spacingJson;
export const elevations = elevationsJson;
export const typography = typographyJson;

// Type exports for TypeScript users
export type Colors = typeof colorsJson;
export type Spacing = typeof spacingJson;
export type Elevations = typeof elevationsJson;
export type Typography = typeof typographyJson;

// Convenience exports
export const semanticColors = colors.semantic;
export const themeColors = colors.themes;
export const darkPalette = colors.dark;
export const lightPalette = colors.light;

export const spacingScale = spacing.scale;
export const spacingPatterns = spacing.patterns;

export const shadowScale = elevations.shadows;
export const elevationHierarchy = elevations.hierarchy;

export const fontFamilies = typography.fontFamilies;
export const fontSizes = typography.fontSizes;
export const fontWeights = typography.fontWeights;
export const textStyles = typography.textStyles;

// Default export with all tokens
export default {
  colors,
  spacing,
  elevations,
  typography,
};


