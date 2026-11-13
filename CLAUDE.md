# Notes for Claude: Engelhard Lab website

Astro 5 static site for https://engelhard-lab.github.io. Pushing to `main` builds and deploys it through GitHub Actions (`.github/workflows/deploy.yml`). The repository is public. See `README.md` for which file controls each part of the site.

## How the owner likes to work

- Go slowly on anything visual: offer two or three options with a recommendation, preview them, and only then change things. Keep the look minimal and "not AI-looking": no dark mode, gradients, or flashy effects.
- Ask before committing or pushing. After a push, confirm the deploy succeeded and the change is live.
- Before committing, check that no drafts, unpublished slides, or PDFs (other than `public/cv.pdf`) are staged. Anything committed is public.

## Local setup (macOS)

- Node is at `/usr/local/bin`, so prefix commands with `PATH=/usr/local/bin:$PATH` (for example `PATH=/usr/local/bin:$PATH npm run build`).
- The preview server is `astro-dev` in `.claude/launch.json` (port 4321; `.claude/` is gitignored). Restart it after changing `src/content.config.ts`, adding a collection's first file, or replacing an image under the same filename. Otherwise it serves stale styles or images, or returns `ImageNotFound`.
- The shell is bash 3.2. Put anything complex (heredocs inside `$(...)`, arrays, multi-step logic) in a script file in the scratchpad.
- The miniforge Python (`/Users/mme4/miniforge3/bin/python3`) has Pillow but fails SSL verification, so fetch URLs with `curl` (e.g. via `subprocess`).
- macOS blocks reading `~/Downloads`. Ask the owner to move files into the project or Dropbox.

## Content model (`src/content.config.ts`)

- **members**: `name`, `title`, `photo`, `start` (year joined; current members sort by it, and `order: 1` keeps the PI first), `order` (tie-break), `former`, `group` (heading for former members), `grad` (shown as ’25), `years`, `now`. Current members without a photo are listed below the photo grid.
- **projects**: `status` is `current`, `group` (shown as "Centers and Consortia"), or `completed`. Optional fields: `funding` (one line), `reporter` (NIH RePORTER URL), `image`, `imageAlt`, `imageCredit`, `publications` (ids), `order`. Each section is ordered by start date, newest first, except that IMPACT-MH is pinned first by request.
- **methods**: same fields as projects, without `status`, `funding`, or `reporter`.
- **publications**: `src/data/publications.yaml`, built from the owner's Duke CV. `type` is `article`, `chapter`, or `preprint`; preprints get their own section at the top of the Publications page. Ids follow the pattern surname + year + first long word (e.g. `hill2025prediction`).
- **news**: one file per item with `date:`. The newest 8 show on the home page, and older ones go under "Older news".
- **outings**: `image`, `caption`, `order` for the Lab culture slideshow.

## Images

- Put images next to the Markdown file that uses them. Resize large ones (about 1400–1800px wide is plenty).
- Figures from papers: use only openly licensed versions (CC BY / CC BY-NC) or the lab's own slides, and add an `imageCredit`. Europe PMC's `.../rest/PMCxxxx/supplementaryFiles` endpoint returns a figure bundle. PMC's own site returns a CAPTCHA to automated requests, so don't scrape it. Publisher figure files are often higher resolution than PMC copies.
- To turn a slide PDF into an image, render it with PyMuPDF at about 1600px wide. Install it in a virtual environment in the scratchpad (`python3 -m venv …` then `pip install pymupdf pillow`), not in the system Python.

## Styling

- `src/styles/global.css` holds the base styles. `src/styles/accents.css` holds the optional color accents (Duke Blue `#012169` for structure, copper `#c84e00` for callouts). Remove the import in `src/layouts/Base.astro` to turn the accents off.
- Project and method entries share `src/components/Entry.astro`: title, funding line, centered figure (80% width, black border), text, then publications.
- The email address on the home page is assembled in the browser (`src/components/Email.astro`) so it never appears in the page source.

## Publishing

```bash
git -c http.postBuffer=524288000 push origin main
```

The larger buffer avoids an upload disconnect seen on big pushes. Pushing workflow changes needs a token with the `workflow` scope. After pushing, check the "Deploy site" run (for example via `https://api.github.com/repos/engelhard-lab/engelhard-lab.github.io/actions/runs`) and then the live page.
