// Builds Word versions of the four departmental-site pages from this repo's content:
//   About the Lab, Research, Lab Members, Publications.
// Run:  PATH=/usr/local/bin:$PATH node scripts/dept-site-docs.mjs
// Output goes to dept-site/ (gitignored). Needs pandoc.
//
// The ordering rules below mirror src/pages/*.astro; if those pages change how
// they sort or group things, update this script to match.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENT = path.join(ROOT, 'src/content');
const OUT = path.join(ROOT, 'dept-site');
const SITE_URL = 'https://engelhard-lab.github.io';
const SCHOLAR = 'https://scholar.google.com/citations?user=0gpvxyoAAAAJ';

// ---------- helpers ----------

// Split a Markdown file into frontmatter (object) and body (string), dropping HTML comments.
function readMd(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const data = m ? yaml.load(m[1]) || {} : {};
  const body = (m ? m[2] : text).replace(/<!--[\s\S]*?-->/g, '').trim();
  return { data, body, dir: path.dirname(file), id: path.basename(file, '.md') };
}

const readDir = (sub) =>
  fs.readdirSync(path.join(CONTENT, sub))
    .filter((f) => f.endsWith('.md'))
    .map((f) => readMd(path.join(CONTENT, sub, f)));

// Make site-relative links (/projects/, /cv.pdf) absolute so they work outside the site.
const absLinks = (md) => md.replace(/\]\((\/[^)]*)\)/g, (_, p) => `](${SITE_URL}${p})`);

// Escape characters that Markdown would otherwise interpret in plain data fields.
const esc = (s) => String(s).replace(/([\\*_\[\]`<>#])/g, '\\$1');

// "’25" from 2025.
const gradYY = (y) => `’${String(y).slice(-2)}`;

// ---------- publications ----------

const pubs = yaml.load(fs.readFileSync(path.join(ROOT, 'src/data/publications.yaml'), 'utf8'));

// Same format as src/components/Publication.astro: authors (PI in bold). Title (linked). *Venue*. note
function pubMd(p) {
  const authors = String(p.authors)
    .split(/(Engelhard [A-Z]{1,2}\*?)/)
    .map((part, i) => (i % 2 ? `**${esc(part)}**` : esc(part)))
    .join('');
  const title = p.link ? `[${esc(p.title)}](${p.link})` : esc(p.title);
  return `${authors}. ${title}. *${esc(p.venue)}*.${p.note ? ' ' + esc(p.note) : ''}`;
}

// ---------- pages ----------

function aboutPage() {
  // Goal box, note to prospective students, and Lab culture (from the About Us page).
  const goal = readMd(path.join(CONTENT, 'goal.md')).body;
  const note = readMd(path.join(CONTENT, 'prospective-students.md')).body;
  const culture = readMd(path.join(CONTENT, 'about/culture.md')).body;
  return [
    '# About the Lab',
    absLinks(goal),
    absLinks(note),
    '## Lab culture',
    culture,
    `For further details about our work and team, including recent lab news, please visit our lab website at [engelhard-lab.github.io](${SITE_URL}).`,
  ].filter(Boolean).join('\n\n');
}

// The home page text (src/content/home.md): the paragraphs below the goal box,
// with links pointing to the github.io Projects, Methods, and About Us pages.
function researchPage() {
  const home = readMd(path.join(CONTENT, 'home.md')).body;
  return ['# Research', absLinks(home)].join('\n\n');
}

function membersPage() {
  // Same grouping and ordering as src/pages/about.astro.
  const GROUPS = [
    'Principal Investigator',
    'Postdoctoral Fellows',
    'Research Fellows',
    'PhD Students',
    'Research Staff',
    'Research Support',
    'Medical Students',
    "Master's Students",
    'Undergraduate Students',
    'Interns',
  ];
  const group = (m) => m.data.group || 'Other';
  const groupRank = (g) => (GROUPS.includes(g) ? GROUPS.indexOf(g) : GROUPS.length);
  const order = (m) => m.data.order ?? 100;
  // "Xiaofeng (Finn) Guo" -> "Guo"; "Matthew Engelhard, MD, PhD" -> "Engelhard".
  const surname = (name) => name.split(',')[0].replace(/\(.*?\)/g, '').trim().split(/\s+/).pop();
  const members = readDir('members');
  const current = members
    .filter((m) => !m.data.former)
    .sort((a, b) =>
      groupRank(group(a)) - groupRank(group(b)) ||
      (a.data.start ?? Infinity) - (b.data.start ?? Infinity) ||
      order(a) - order(b) ||
      surname(a.data.name).localeCompare(surname(b.data.name)));
  const alumni = members
    .filter((m) => m.data.former)
    .sort((a, b) => (b.data.grad ?? 0) - (a.data.grad ?? 0) || order(a) - order(b));
  const currentGroups = [...new Set([...GROUPS, ...current.map(group)])];
  const groups = [...new Set([...GROUPS, ...alumni.map(group)])];

  // Under a subheading, drop the role when it just repeats the heading:
  // "PhD Student, CBB" under "PhD Students" -> "CBB"; "Principal Investigator" -> "".
  const detail = (m) => {
    const [role, ...rest] = m.data.title.split(', ');
    const g = group(m);
    return role === g || role + 's' === g ? rest.join(', ') : m.data.title;
  };
  const out = ['# Lab Members', '## Current members'];
  for (const g of currentGroups) {
    const people = current.filter((m) => group(m) === g);
    if (!people.length) continue;
    out.push(`### ${g}`);
    out.push(people.map((m) => `- ${esc(m.data.name)}${detail(m) ? ', ' + esc(detail(m)) : ''}`).join('\n'));
  }
  out.push('## Former members');
  for (const g of groups) {
    const people = alumni.filter((m) => group(m) === g);
    if (!people.length) continue;
    out.push(`### ${g}`);
    out.push(people.map((m) => {
      let s = `- ${esc(m.data.name)}, ${esc(m.data.title)}`;
      if (m.data.grad) s += ` ${gradYY(m.data.grad)}`;
      if (m.data.years) s += ` (${esc(m.data.years)})`;
      if (m.data.now) s += `. Now: ${absLinks(m.data.now)}`;
      return s;
    }).join('\n'));
  }
  return out.join('\n\n');
}

function publicationsPage() {
  const type = (p) => p.type || 'article';
  const preprints = pubs.filter((p) => type(p) === 'preprint');
  const articles = pubs.filter((p) => type(p) === 'article');
  const chapters = pubs.filter((p) => type(p) === 'chapter');
  const years = [...new Set(articles.map((p) => p.year))].sort((a, b) => b - a);
  const list = (ps) => ps.map((p) => '- ' + pubMd(p)).join('\n');

  const out = [
    '# Publications',
    `See also [Google Scholar](${SCHOLAR}) and Matthew Engelhard's [CV (PDF)](${SITE_URL}/cv.pdf).`,
    '\\* These authors jointly supervised this work.',
  ];
  if (preprints.length) out.push('## Preprints', list(preprints));
  for (const y of years) out.push(`## ${y}`, list(articles.filter((p) => p.year === y)));
  if (chapters.length) out.push('## Book chapters', list(chapters));
  return out.join('\n\n');
}

// ---------- build ----------

fs.mkdirSync(OUT, { recursive: true });
const ref = path.join(ROOT, 'scripts/dept-site-reference.docx');
const pages = [
  ['About the Lab', aboutPage],
  ['Research', researchPage],
  ['Lab Members', membersPage],
  ['Publications', publicationsPage],
];
for (const [name, build] of pages) {
  const md = build();
  const mdFile = path.join(OUT, `${name}.md`);
  const docx = path.join(OUT, `${name}.docx`);
  fs.writeFileSync(mdFile, md + '\n');
  const args = [mdFile, '-f', 'markdown', '-o', docx];
  if (fs.existsSync(ref)) args.push('--reference-doc', ref);
  execFileSync('pandoc', args, { stdio: 'inherit' });
  console.log('wrote', path.relative(ROOT, docx));
}
