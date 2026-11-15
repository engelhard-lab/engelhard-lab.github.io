import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// One Markdown file per person in src/content/members/.
const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string(),
      photo: image().optional(),
      // Year the person joined the lab. Within each group, the team is listed by start
      // year (earliest first); people without one go at the end of their group.
      start: z.number().int().optional(),
      // Optional manual override within a group and start year (lower comes first).
      // Without it, ties are broken alphabetically by surname.
      order: z.number().default(100),
      // Former members: set `former: true`, and optionally `years` and `now`.
      former: z.boolean().default(false),
      // e.g. "PhD Students" or "Master's Students". Sets where current members are listed
      // (group order is in src/pages/about.astro) and the heading for former members.
      group: z.string().default('Other'),
      // Former members only: graduation year, shown after the program as ’25.
      grad: z.number().int().optional(),
      years: z.string().optional(),
      now: z.string().optional(),
    }),
});

// All publications live in one YAML list, copied from the CV.
const publications = defineCollection({
  loader: file('./src/data/publications.yaml'),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number().int(),
    link: z.string().url().optional(),
    type: z.enum(['article', 'chapter', 'preprint']).default('article'),
    note: z.string().optional(),
  }),
});

// Projects and methods areas share a shape: title, image, description (the
// Markdown body), and representative publications listed by their id in
// src/data/publications.yaml.
const entry = ({ image }: { image: () => z.ZodTypeAny }) =>
  z.object({
    title: z.string(),
    image: image().optional(),
    imageAlt: z.string().default(''),
    // Shown under the image, e.g. "Figure: Smith et al., Journal 2024 (CC BY)".
    imageCredit: z.string().optional(),
    publications: z.array(reference('publications')).default([]),
    order: z.number().default(100),
  });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: (ctx) =>
    entry(ctx).extend({
      // current, group (listed under "Centers and Consortia"), or completed.
      status: z.enum(['current', 'group', 'completed']),
      // Funding line, e.g. "NIMH K01MH127309 (PI: Engelhard), 2022–2027".
      funding: z.string().optional(),
      // NIH RePORTER page for the award.
      reporter: z.string().url().optional(),
    }),
});

const methods = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/methods' }),
  schema: entry,
});

// Team outing photos for the About Us slideshow.
const outings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/outings' }),
  schema: ({ image }) => z.object({ image: image(), caption: z.string().optional(), order: z.number().default(100) }),
});

// Short news items shown on the home page.
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({ date: z.coerce.date() }),
});

export const collections = { members, publications, projects, methods, outings, news };
