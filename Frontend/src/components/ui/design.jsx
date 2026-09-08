/**
 * Shared visual language extracted from the home page redesign: icons, the
 * scroll-reveal wrapper, decorative background blobs, section label pills,
 * and the category color tokens used for gradient card headers. Other pages
 * import from here instead of duplicating this markup so the whole app stays
 * visually consistent with the home page.
 */
import { useEffect, useRef, useState } from 'react'
import { iconPaths, categoryStyles } from './tokens'

export function Icon({ name, className = 'h-5 w-5' }) {
  const d = iconPaths[name]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Blob({ className }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
}

/**
 * Fades + slides content in the first time it scrolls into view. Falls back
 * to always-visible when IntersectionObserver isn't available (rather than
 * flipping visible in an effect, which trips the set-state-in-effect lint
 * rule) so content is never stuck invisible.
 */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionLabel({ children, tone = 'light' }) {
  return (
    <p
      className={`mb-4 inline-flex rounded-full px-3 py-1.5 text-[11px] font-black ${
        tone === 'dark' ? 'bg-white/10 text-[#B8CAFF] ring-1 ring-white/20' : 'bg-[#E7EEFF] text-[#2551D9]'
      }`}
    >
      {children}
    </p>
  )
}

export function Pill({ children, onClick, active = false }) {
  const interactive = typeof onClick === 'function'
  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black transition-colors ${
        active
          ? 'border-[#5472FC] bg-[#E7EEFF] text-[#2551D9]'
          : 'border-gray-200 bg-white text-slate-950'
      } ${interactive ? 'cursor-pointer hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9]' : ''}`}
    >
      {children}
    </span>
  )
}

/**
 * A result card with a flush colored gradient header (icon + kicker chip +
 * optional badge) and a white body below -- the pattern established by the
 * home page's featured colleges/jobs/classes cards. Used for list-page grids
 * so browse pages read as a continuation of the home page.
 */
export function GradientCard({ onClick, accent = 'blue', icon, kicker, badge, title, subtitle, metaItems, footer, children }) {
  const grad = categoryStyles[accent] || categoryStyles.blue
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-inset ring-gray-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className={`relative flex h-28 items-center justify-center rounded-t-2xl bg-gradient-to-br ${grad}`}>
        {kicker && (
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-800">
            {kicker}
          </span>
        )}
        {badge && <span className="absolute right-3 top-3">{badge}</span>}
        <Icon name={icon} className="h-10 w-10 text-white/85 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-[2.5rem] line-clamp-2 text-sm font-black leading-snug text-slate-950 group-hover:text-[#2551D9]">
          {title}
        </h3>
        {subtitle && <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{subtitle}</p>}
        {metaItems && metaItems.length > 0 && (
          <div className="mt-3 flex flex-col gap-1 text-[11px] font-bold text-slate-500">
            {metaItems.map((m, i) => (
              <span key={i} className="flex min-w-0 items-center gap-1">
                <Icon name={m.icon} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{m.text}</span>
              </span>
            ))}
          </div>
        )}
        {children}
        <div className="mt-auto flex items-center gap-1 border-t border-gray-100 pt-3 text-xs font-black text-[#5472FC] transition-transform duration-300 group-hover:translate-x-1">
          {footer || 'View details'} <span aria-hidden="true">→</span>
        </div>
      </div>
    </button>
  )
}
