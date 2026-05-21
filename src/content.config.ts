import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { changelogLoader } from './content/loaders/changelog-loader';

/**
 * Changelog collection schema
 * Defines the structure of changelog entries for type-safety
 */
const changelog = defineCollection({
  loader: changelogLoader,
  schema: z.object({
    version: z.string(),
    date: z.coerce.date(),
    category: z.enum(['added', 'changed', 'deprecated', 'removed', 'fixed', 'security']),
    type: z.enum(['component', 'token', 'system']),
    target: z.string(),
    title: z.string(),
    description: z.string(),
    breaking: z.boolean().default(false),
    properties: z.array(z.object({
      name: z.string(),
      change: z.string(),
      before: z.string().nullish(),
      after: z.string().nullish(),
    })).optional(),
    tokenPath: z.string().optional(),
    commit: z.object({
      hash: z.string(),
      message: z.string(),
      author: z.string(),
      date: z.coerce.date(),
    }).optional(),
  }),
});

export const collections = {
  changelog
};