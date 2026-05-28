import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'

/**
 * Horizontally scrolling strip of trust statements. Uses the existing
 * `.marquee-track` CSS animation. Hover pauses it (defined in index.css).
 */
export function TrustMarquee() {
  const { lang } = useLanguage()
  const items = [
    t(lang, 'trustEasy'),
    t(lang, 'trustFast'),
    t(lang, 'trustCancel'),
    t(lang, 'trustGuarantee'),
  ]
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...items, ...items, ...items]

  return (
    <div className="border-card-border bg-bg-sec/40 relative w-full overflow-hidden border-y backdrop-blur-sm">
      <div className="marquee-track flex w-[300%] gap-12 py-3 text-sm whitespace-nowrap">
        {loop.map((item, i) => (
          <span key={i} className="text-text-muted flex shrink-0 items-center gap-3">
            <span className="text-accent">●</span>
            {item}
          </span>
        ))}
      </div>
      <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent" />
      <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent" />
    </div>
  )
}
