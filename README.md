# Engelhard Lab website

Source for [engelhard-lab.github.io](https://engelhard-lab.github.io), built with [Astro](https://astro.build) and deployed to GitHub Pages on every push to `main`.

## Editing content

| To change… | Edit |
| --- | --- |
| Home page goal box | `src/content/goal.md` |
| Home page text (below the goal box) | `src/content/home.md` (add sections with `## Heading`) |
| Note to prospective students (box above Lab news) | `src/content/prospective-students.md` (leave empty to hide the box) |
| News (home page) | One short Markdown file per item in `src/content/news/`, with `date:` at the top |
| Projects | One Markdown file per project in `src/content/projects/` (`status: current`, `group` for Centers and Consortia, or `completed`; optional `funding:` line and `reporter:` link) |
| Methods | One Markdown file per area in `src/content/methods/` |
| Publications | `src/data/publications.yaml` |
| Team and former members | One Markdown file per person in `src/content/members/`, with the photo next to it. `start:` (year joined) sets the order; `former: true` moves someone to Former members, listed under their `group:` heading, with `grad:` (graduation year) shown as ’25 |
| Team outing photos | One Markdown file per photo in `src/content/outings/` with `image:` and `caption:` |
| About Us text | `src/content/about/location.md` and `src/content/about/culture.md` |
| CV | Replace `public/cv.pdf` |
| Email, links, menu | `src/site.ts` |

Projects and methods list representative publications by their `id` from `publications.yaml`.
Images go next to the Markdown file that uses them (e.g. `image: ./photo.jpg`).

## Running locally

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```
