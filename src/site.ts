// Site-wide settings used by the layout and pages.
export const SITE = {
  name: 'Engelhard Lab',
  affiliation: 'Duke University',
  tagline: 'Machine learning methods for next-generation clinical decision support',
  // The email is stored in two parts and joined in the browser, so the full
  // address never appears in the page source (this cuts down on spam harvesting).
  email: { user: 'm.engelhard', domain: 'duke.edu' },
  // Put the PDF at public/cv.pdf.
  cv: '/cv.pdf',
  mapUrl: 'https://maps.app.goo.gl/rkVx2Ed6xysDh1de9',
  links: {
    github: 'https://github.com/engelhard-lab',
    scholar: 'https://scholar.google.com/citations?user=0gpvxyoAAAAJ',
    dukeScholars: 'https://scholars.duke.edu/person/m.engelhard',
    orcid: 'https://orcid.org/0000-0003-4112-9639',
  },
};

export const NAV = [
  { href: '/about/', label: 'About Us' },
  { href: '/projects/', label: 'Projects' },
  { href: '/methods/', label: 'Methods' },
  { href: '/publications/', label: 'Publications' },
];
