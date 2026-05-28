import type { Lang } from './language'

/**
 * Translations follow the same flat-key pattern as elkie.co.za v1.
 * For step 1 we only ship English; the other locales fall back to English
 * via the `t()` helper until we fill them in (step 2+).
 */

type Strings = {
  // Header / nav
  navHome: string
  navWork: string
  navPricing: string
  navStart: string
  navLogin: string
  // Hero
  heroEyebrow: string
  heroHeadline: string
  heroSub: string
  ctaStart: string
  ctaDemo: string
  // Trust strip
  trustEasy: string
  trustFast: string
  trustCancel: string
  trustGuarantee: string
  // Problem
  problemEyebrow: string
  problemTitle: string
  problemBody1: string
  problemBody2: string
  // Solution
  solutionEyebrow: string
  solutionTitle: string
  solutionBody: string
  solutionPoint1: string
  solutionPoint2: string
  solutionPoint3: string
  // How it works
  howEyebrow: string
  howTitle: string
  howSub: string
  howStep1Title: string
  howStep1Desc: string
  howStep2Title: string
  howStep2Desc: string
  howStep3Title: string
  howStep3Desc: string
  // Recent work showcase
  workEyebrow: string
  workTitle: string
  workSub: string
  workCta: string
  // Dashboard demo
  dashEyebrow: string
  dashTitle: string
  dashSub: string
  dashPoint1: string
  dashPoint2: string
  dashPoint3: string
  // Pricing teaser
  pricingEyebrow: string
  pricingTitle: string
  pricingSub: string
  pricingMostPopular: string
  pricingPerMonth: string
  pricingOnceOff: string
  pricingSelect: string
  pricingSeeAll: string
  // Testimonials
  testimonialsEyebrow: string
  testimonialsTitle: string
  testimonialsSub: string
  // Final CTA
  finalEyebrow: string
  finalTitle: string
  finalSub: string
  // Footer
  footerTagline: string
  footerCopy: string
}

export const T: Record<Lang, Partial<Strings>> = {
  en: {
    navHome: 'Home',
    navWork: 'Work',
    navPricing: 'Pricing',
    navStart: 'Start',
    navLogin: 'Login',
    heroEyebrow: 'Now international',
    heroHeadline: 'We build the website. You just describe it.',
    heroSub: 'Tell us about your business. We craft your online presence in 48 hours.',
    ctaStart: 'Start Building →',
    ctaDemo: 'See Live Demo →',
    trustEasy: 'No tech skills needed',
    trustFast: 'Live in 48 hours',
    trustCancel: 'Cancel anytime',
    trustGuarantee: 'Money-back guarantee',
    problemEyebrow: 'The status quo',
    problemTitle: 'Building a website should not feel like this.',
    problemBody1:
      'Hiring a web agency is slow, expensive, and full of meetings you did not ask for.',
    problemBody2:
      'DIY builders take weeks of fiddling — and your site ends up looking like everyone else’s.',
    solutionEyebrow: 'A better way',
    solutionTitle: 'You describe it. We ship it. Live in 48 hours.',
    solutionBody:
      'Skip the agency quote-and-wait spiral. Skip the drag-and-drop weekend that never ends. Tell us about your business in a five-minute form and we hand you a finished, professional site.',
    solutionPoint1: 'Designed by humans, accelerated by AI',
    solutionPoint2: 'Hosting, updates, and security included',
    solutionPoint3: 'Edit your own content from a simple dashboard',
    howEyebrow: 'How it works',
    howTitle: 'Three steps, one beautiful site.',
    howSub: 'No code, no quote calls, no waiting list.',
    howStep1Title: 'Describe it',
    howStep1Desc:
      'Spend five minutes telling us about your business, your customers, and what makes you special.',
    howStep2Title: 'We build it',
    howStep2Desc:
      'Our team — paired with AI for speed — designs and develops your site with care and precision.',
    howStep3Title: 'Go live',
    howStep3Desc:
      'Your site launches in under 48 hours. Hosting, domain, updates — all handled.',
    workEyebrow: 'Recent work',
    workTitle: 'Real businesses. Real websites.',
    workSub:
      'Every site we build is fully custom — no template lock-in. Here’s a selection of recent launches across different industries.',
    workCta: 'See all recent work →',
    dashEyebrow: 'Your dashboard',
    dashTitle: 'Your business, in one calm screen.',
    dashSub:
      'After we launch, you own a private dashboard for editing copy, swapping themes, reading messages, and watching your traffic grow — without ever opening a code file.',
    dashPoint1: 'Edit any text, image, or contact detail in seconds',
    dashPoint2: 'Read every contact-form message in a tidy inbox',
    dashPoint3: 'See real visitor stats — page views, sources, devices',
    pricingEyebrow: 'Simple pricing',
    pricingTitle: 'Pick the plan that fits today. Upgrade anytime.',
    pricingSub: 'All plans include hosting, mobile design, SSL, and unlimited support.',
    pricingMostPopular: 'Most popular',
    pricingPerMonth: '/mo',
    pricingOnceOff: 'one-off setup',
    pricingSelect: 'Select plan',
    pricingSeeAll: 'Compare every plan →',
    testimonialsEyebrow: 'What clients say',
    testimonialsTitle: 'Real businesses. Real launches.',
    testimonialsSub: 'A small sample of the founders we have built for around the world.',
    finalEyebrow: 'Last step',
    finalTitle: 'Ready to launch?',
    finalSub: 'Five-minute form. A real human reads every one. Your site goes live in 48 hours.',
    footerTagline: 'Beautiful websites, built fast.',
    footerCopy: '© 2026 Elkie Web Studio',
  },
  es: {},
  fr: {},
  pt: {},
  de: {},
}

/** Translate `key` for the active language, falling back to English. */
export function t(lang: Lang, key: keyof Strings): string {
  return (T[lang]?.[key] ?? T.en[key] ?? key) as string
}
