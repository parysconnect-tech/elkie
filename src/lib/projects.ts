/**
 * Central project metadata for the /work portfolio.
 *
 * For step 15 these are STYLISED PLACEHOLDERS — each one represents the
 * kind of business we'd like to showcase. Replace with real launched
 * projects as they ship (the `// TODO` comments mark every spot to swap).
 */

export type ProjectCategory =
  | 'Restaurant'
  | 'Portfolio'
  | 'Salon & Spa'
  | 'Trades'
  | 'E-commerce'
  | 'Fitness'
  | 'Real estate'
  | 'Agency'

export type Project = {
  slug: string
  /** Real business name once launched; placeholder until then */
  client: string
  category: ProjectCategory
  /** Short human-readable industry label */
  industry: string
  /** 1–2 sentence summary of what we built */
  description: string
  /** Year/month launched, e.g. "2026 · Jan" */
  launchedAt: string
  /** Live URL once published; null until then */
  liveUrl: string | null
  /** Tailwind gradient classes for the placeholder thumbnail */
  swatch: string
  /** Two-word vibe descriptor shown under the title */
  vibe: string
  /** Mock content for the in-page preview frame */
  sampleHeadline: string
  sampleSub: string
  sampleCta: string
  /** "serif" → headline uses serif font in the preview */
  headingFont: 'serif' | 'sans-serif'
  /** Optional case-study extras */
  testimonial?: { quote: string; name: string; role: string }
}

// TODO: replace each entry below with a real launched project as they ship.
export const PROJECTS: Project[] = [
  {
    slug: 'madeira-kitchen',
    client: 'Madeira Kitchen',
    category: 'Restaurant',
    industry: 'Neighbourhood bistro',
    description:
      'A warm, photo-led one-pager for a small Lisbon kitchen — menu, hours, photo grid, contact form.',
    launchedAt: '2026 · Jan',
    liveUrl: null,
    swatch: 'from-amber-500 via-orange-600 to-rose-700',
    vibe: 'serif · warm',
    sampleHeadline: 'Slow-cooked. Locally sourced.',
    sampleSub: 'A small neighbourhood kitchen serving honest food, six days a week.',
    sampleCta: 'View the menu',
    headingFont: 'serif',
  },
  {
    slug: 'jordan-reyes-photography',
    client: 'Jordan Reyes Photography',
    category: 'Portfolio',
    industry: 'Commercial photographer',
    description:
      'Minimal, monochrome portfolio for a commercial photographer — case grid, project pages, simple contact.',
    launchedAt: '2025 · Nov',
    liveUrl: null,
    swatch: 'from-zinc-800 via-zinc-600 to-zinc-300',
    vibe: 'mono · minimal',
    sampleHeadline: 'Selected work, 2018 – 2026.',
    sampleSub: 'Available for commissions worldwide. Currently in Lisbon.',
    sampleCta: 'See the archive',
    headingFont: 'sans-serif',
  },
  {
    slug: 'lumina-spa',
    client: 'Lumina Spa',
    category: 'Salon & Spa',
    industry: 'Boutique spa & wellness',
    description:
      'A soft, pastel booking-led site with services, pricing, and an embedded booking widget.',
    launchedAt: '2025 · Oct',
    liveUrl: null,
    swatch: 'from-pink-300 via-rose-200 to-amber-100',
    vibe: 'pastel · soft',
    sampleHeadline: 'A little ritual, just for you.',
    sampleSub: 'Hair, nails, skin. Open Tuesday through Saturday.',
    sampleCta: 'Book your slot',
    headingFont: 'serif',
  },
  {
    slug: 'iron-oak-builders',
    client: 'Iron & Oak Builders',
    category: 'Trades',
    industry: 'General contractor',
    description:
      'Bold industrial look for a general contractor — services, gallery, quote request form.',
    launchedAt: '2025 · Sep',
    liveUrl: null,
    swatch: 'from-slate-900 via-slate-700 to-orange-600',
    vibe: 'bold · industrial',
    sampleHeadline: 'Built right. The first time.',
    sampleSub: '20 years of trade work across the region. Quote in 24h.',
    sampleCta: 'Get a quote',
    headingFont: 'sans-serif',
  },
  {
    slug: 'tessera-goods',
    client: 'Tessera Goods',
    category: 'E-commerce',
    industry: 'Small-batch homeware',
    description:
      'Clean, modern shop for a made-to-order ceramics brand — product grid, lookbook, Shopify Buy buttons.',
    launchedAt: '2025 · Aug',
    liveUrl: null,
    swatch: 'from-neutral-100 via-neutral-50 to-stone-200',
    vibe: 'clean · modern',
    sampleHeadline: 'Made to last. Small batches.',
    sampleSub: 'Considered objects for the everyday. Shipped worldwide.',
    sampleCta: 'Shop the new drop',
    headingFont: 'sans-serif',
  },
  {
    slug: 'reps-reps-coaching',
    client: 'Reps & Reps Coaching',
    category: 'Fitness',
    industry: 'Personal training',
    description:
      'High-energy site for a 1:1 coaching business — pricing tiers, class timetable, before/after gallery.',
    launchedAt: '2025 · Jul',
    liveUrl: null,
    swatch: 'from-lime-500 via-emerald-500 to-teal-600',
    vibe: 'energetic · loud',
    sampleHeadline: 'Show up. Get strong.',
    sampleSub: '1:1 coaching and small-group classes, six days a week.',
    sampleCta: 'Start free trial',
    headingFont: 'sans-serif',
  },
  {
    slug: 'halsey-sterling',
    client: 'Halsey & Sterling',
    category: 'Real estate',
    industry: 'Luxury real estate',
    description:
      'Stately, serif-led site for a luxury property firm — listings, agent profiles, market reports.',
    launchedAt: '2025 · Jun',
    liveUrl: null,
    swatch: 'from-stone-800 via-amber-900 to-stone-200',
    vibe: 'luxe · serif',
    sampleHeadline: 'Homes worth waiting for.',
    sampleSub: 'Curated listings across the city and coast.',
    sampleCta: 'View listings',
    headingFont: 'serif',
  },
  {
    slug: 'north-light-studio',
    client: 'North Light Studio',
    category: 'Agency',
    industry: 'Creative agency',
    description:
      'Loud, brutalist one-pager for a two-person Berlin design studio — case grid, hover glitches, contact.',
    launchedAt: '2025 · May',
    liveUrl: null,
    swatch: 'from-fuchsia-600 via-violet-700 to-indigo-900',
    vibe: 'brutalist · loud',
    sampleHeadline: 'We make weird things on purpose.',
    sampleSub: 'A two-person studio in Berlin. Selected clients, no logo wall.',
    sampleCta: 'Send a brief',
    headingFont: 'sans-serif',
  },
]

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Restaurant',
  'Portfolio',
  'Salon & Spa',
  'Trades',
  'E-commerce',
  'Fitness',
  'Real estate',
  'Agency',
]

export function findProject(slug: string | undefined): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}
