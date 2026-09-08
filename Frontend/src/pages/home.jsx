import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../api/endpoints'

const defaultStaticRecommendations = [
  {
    label: 'College Match',
    title: 'Kathmandu Tech College',
    meta: 'BCA - Kathmandu - Scholarship available',
  },
  {
    label: 'Internship Match',
    title: 'Python Django Intern',
    meta: 'Pi Innovations - Hybrid - NPR 8k-15k',
  },
  {
    label: 'Online Class',
    title: 'Python for Beginners',
    meta: 'Live class - 6 weeks - Certificate',
  },
  {
    label: 'CV Suggestion',
    title: 'Create Internship CV',
    meta: 'Use your profile to prepare a student CV',
  },
  {
    label: 'Skill Suggestion',
    title: 'Improve React Basics',
    meta: 'Useful for frontend internships',
  },
]

const searchTabs = [
  { key: 'colleges', label: 'Colleges' },
  { key: 'opportunities', label: 'Jobs & Internships' },
  { key: 'classes', label: 'Online Classes' },
]

const searchPlaceholders = [
  'Search college, course, city...',
  'Search job title, company, skill...',
  'Search class, subject, instructor...',
]

const collegeTags = ['BCA', 'BIT', 'BSc CSIT', 'BBA', 'Engineering']
const collegeCityOptions = ['Kathmandu', 'Pokhara', 'Lalitpur']
const opportunityTags = ['Internship', 'Remote', 'Python', 'Marketing', 'Robotics']
const classTags = ['Beginner', 'Python', 'Marketing', 'Robotics', 'Design']

const popularTopics = [
  { label: 'Computer Science', target: '/colleges?course=BSc%20CSIT' },
  { label: 'BCA', target: '/colleges?course=BCA' },
  { label: 'Engineering', target: '/colleges?course=Engineering' },
  { label: 'Scholarships', target: '/colleges?search=Scholarship' },
  { label: 'Remote Jobs', target: '/jobs?workMode=remote' },
  { label: 'Internships', target: '/jobs?type=internship' },
  { label: 'Python', target: '/online-classes?search=Python' },
  { label: 'Design', target: '/online-classes?search=Design' },
  { label: 'Robotics', target: '/online-classes?search=Robotics' },
  { label: 'Marketing', target: '/jobs?search=Marketing' },
]

const howItWorksSteps = [
  {
    step: '01',
    icon: 'profile',
    title: 'Create your profile',
    text: 'Add your education, skills, and career interests so EduPath knows what to look for.',
  },
  {
    step: '02',
    icon: 'target',
    title: 'Get matched instantly',
    text: 'See colleges, jobs, internships, and classes ranked by how well they fit you.',
  },
  {
    step: '03',
    icon: 'rocket',
    title: 'Apply and grow',
    text: 'Send inquiries, submit applications, and build a CV - all without leaving EduPath.',
  },
]

const dashboardCards = [
  {
    title: 'Student',
    tag: 'For students',
    icon: 'user',
    accent: 'blue',
    text: 'Saved colleges, saved jobs, applications, and profile.',
    getHref: (authed) => (authed ? '/profile' : '/register'),
  },
  {
    title: 'College',
    tag: 'For institutions',
    icon: 'building',
    accent: 'violet',
    text: 'Profile, courses, inquiries, admission status, and analytics.',
    getHref: () => '/list-college',
  },
  {
    title: 'Employer',
    tag: 'For employers',
    icon: 'briefcase',
    accent: 'emerald',
    text: 'Post jobs, view applicants, and shortlist students.',
    getHref: () => '/post-job',
  },
  {
    title: 'Instructor',
    tag: 'For instructors',
    icon: 'chalkboard',
    accent: 'amber',
    text: 'Post online classes, manage enrollments, and share learning materials.',
    getHref: () => '/post-class',
  },
  {
    title: 'CV Maker',
    tag: 'For everyone',
    icon: 'document',
    accent: 'rose',
    text: 'Students can build CVs and use them while applying for internships or jobs.',
    getHref: () => '/cv-maker',
  },
]

const testimonials = [
  {
    name: 'Susant Lamsal',
    location: 'Salakpur, Nepal',
    initials: 'SL',
    tone: 'from-rose-200 to-orange-100',
    text: 'EduPath completely transformed how I approached my college search. The recommendations were clear, relevant, and made a complicated decision feel manageable.',
  },
  {
    name: 'Prashanta Chamlagain',
    location: 'Damak, Nepal',
    initials: 'PC',
    tone: 'from-amber-200 to-yellow-100',
    text: 'I found an internship that fits my skills and schedule. Everything I needed—from the application details to CV guidance—was in one place.',
  },
  {
    name: 'Ronak Adhikari',
    location: 'Biratnagar, Nepal',
    initials: 'RA',
    tone: 'from-sky-200 to-indigo-100',
    text: 'The course and college information is engaging and easy to understand. Comparing options helped me choose a path with much more confidence.',
  },
  {
    name: 'Saurabh Karki',
    location: 'Itahari, Nepal',
    initials: 'SK',
    tone: 'from-violet-200 to-fuchsia-100',
    text: 'The online classes are excellent. I could start with the basics, build practical skills, and keep track of every step from my dashboard.',
  },
  {
    name: 'Achyut Parajuli',
    location: 'Biratnagar, Nepal',
    initials: 'AP',
    tone: 'from-emerald-200 to-teal-100',
    text: 'I have explored several programs through EduPath, and each one was presented with the details that actually matter to a student.',
  },
  {
    name: 'Sujan Subedi',
    location: 'Belbari, Nepal',
    initials: 'SS',
    tone: 'from-blue-200 to-cyan-100',
    text: 'I wanted to take my career skills to the next level. EduPath showed me useful classes and opportunities that matched my goals.',
  },
]

function formatRecommendationItem(item) {
  if (item.label && item.title && item.meta) return item
  if (item.collegeName) {
    return {
      id: item._id || item.id,
      label: 'College Match',
      title: item.collegeName,
      meta: `${item.courses?.[0] || 'Degree'} - ${item.city || 'Nepal'} - Scholarship available`,
      matchPercentage: item.matchPercentage,
    }
  }
  if (item.companyName || item.type) {
    return {
      id: item._id || item.id,
      label: item.type === 'internship' ? 'Internship Match' : 'Job Match',
      title: item.title,
      meta: `${item.companyName} - ${item.workMode || item.location || 'Onsite'} - ${item.stipendOrSalaryRange || 'Competitive'}`,
      matchPercentage: item.matchPercentage,
    }
  }
  if (item.classTitle) {
    return {
      id: item._id || item.id,
      label: 'Online Class',
      title: item.classTitle,
      meta: `${item.mode || 'Live class'} - ${item.duration || 'Flexible'} - ${item.certificateAvailability ? 'Certificate' : 'Course'}`,
      matchPercentage: item.matchPercentage,
    }
  }
  return {
    id: item._id || item.id,
    label: item.label || 'Recommendation',
    title: item.title || item.name || 'Recommended Item',
    meta: item.meta || item.description || '',
    matchPercentage: item.matchPercentage,
  }
}

const iconPaths = {
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5.5 21a6.5 6.5 0 0 1 13 0',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z',
  rocket:
    'M14.5 3.5c2.5.5 5 3 5.5 5.5.5 2.5-1 6-4.5 9.5l-2-2-2-2c3.5-3.5 7-5 9.5-4.5M6 15l-2.5 2.5M9 18l-2.5 2.5M9.5 14.5 5 10c1-2 3-3.5 5-4l4.5 4.5c-.5 2-2 4-5 4Z',
  user: 'M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 20a7 7 0 0 1 14 0',
  building: 'M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M12 21v-8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8M4 21h16M7.5 7h1M7.5 11h1M7.5 15h1M15.5 12h1M15.5 16h1',
  briefcase:
    'M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  chalkboard: 'M4 4h16v11H4V4Zm4 15 4-4 4 4M4 19h16',
  document: 'M8 3h6l4 4v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm5 0v4h4M9 12h6M9 15.5h6M9 8.5h2',
  graduation: 'M3 9.5 12 5l9 4.5-9 4.5-9-4.5Zm4.5 2.5v4c0 1.5 2 3 4.5 3s4.5-1.5 4.5-3v-4M20 9.5V15',
  laptop: 'M5 4h14a1 1 0 0 1 1 1v10H4V5a1 1 0 0 1 1-1Zm-3 13h20l-1.5 3a1 1 0 0 1-1 .6H4.5a1 1 0 0 1-1-.6L2 17Z',
  pin: 'M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  plus: 'M12 5v14M5 12h14',
}

function Icon({ name, className = 'h-5 w-5' }) {
  const d = iconPaths[name]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Blob({ className }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
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

function Pill({ children, onClick }) {
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
      className={`inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-950 ${
        interactive ? 'cursor-pointer transition-colors hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9]' : ''
      }`}
    >
      {children}
    </span>
  )
}

function SectionLabel({ children, tone = 'light' }) {
  return (
    <p
      className={`mb-4 inline-flex rounded-full px-3 py-1.5 text-[11px] font-black ${
        tone === 'dark'
          ? 'bg-white/10 text-[#B8CAFF] ring-1 ring-white/20'
          : 'bg-[#E7EEFF] text-[#2551D9]'
      }`}
    >
      {children}
    </p>
  )
}

function StatBlock({ value, label, icon }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B8CAFF] ring-1 ring-white/15">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      {value === null ? (
        <span className="h-10 w-20 animate-pulse rounded-lg bg-white/10" />
      ) : (
        <span className="text-4xl font-black text-white sm:text-5xl">
          {value}
          {value >= 20 ? '+' : ''}
        </span>
      )}
      <span className="text-xs font-bold uppercase tracking-wide text-white/60">{label}</span>
    </div>
  )
}

function CarouselRow({ children }) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const itemCount = Array.isArray(children) ? children.length : children ? 1 : 0

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const updateScrollState = () => {
      setCanScrollLeft(track.scrollLeft > 4)
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
    }

    updateScrollState()
    track.addEventListener('scroll', updateScrollState, { passive: true })

    if (typeof ResizeObserver === 'undefined') {
      return () => track.removeEventListener('scroll', updateScrollState)
    }
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(track)
    return () => {
      track.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [itemCount])

  const scrollByAmount = (dir) => {
    const track = trackRef.current
    if (!track) return
    const card = track.firstElementChild
    const cardWidth = card ? card.getBoundingClientRect().width : 300
    track.scrollBy({ left: dir * (cardWidth + 16) * 1.4, behavior: 'smooth' })
  }

  const showArrows = canScrollLeft || canScrollRight

  return (
    <div className="relative">
      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
        {children}
      </div>
      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            className={`absolute -left-4 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-black text-slate-600 shadow-lg transition-all duration-200 hover:border-[#5472FC] hover:text-[#2551D9] md:flex ${
              canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll right"
            disabled={!canScrollRight}
            className={`absolute -right-4 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-black text-slate-600 shadow-lg transition-all duration-200 hover:border-[#5472FC] hover:text-[#2551D9] md:flex ${
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

const categoryStyles = {
  blue: 'from-[#5472FC] to-[#22308F]',
  emerald: 'from-emerald-500 to-emerald-800',
  violet: 'from-violet-500 to-violet-800',
  amber: 'from-amber-500 to-amber-700',
  rose: 'from-rose-500 to-rose-700',
}

function FeaturedCard({ onClick, accent = 'blue', icon, kicker, badge, title, subtitle, metaItems, footer }) {
  const grad = categoryStyles[accent] || categoryStyles.blue
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:w-[300px]"
    >
      <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${grad}`}>
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-800">
          {kicker}
        </span>
        {badge && <span className="absolute right-3 top-3">{badge}</span>}
        <Icon name={icon} className="h-10 w-10 text-white/85 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="p-4">
        <h3 className="min-h-[2.5rem] line-clamp-2 text-sm font-black leading-snug text-slate-950 group-hover:text-[#2551D9]">
          {title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{subtitle}</p>
        {metaItems && metaItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
            {metaItems.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Icon name={m.icon} className="h-3.5 w-3.5" />
                {m.text}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-3 text-xs font-black text-[#5472FC] transition-transform duration-300 group-hover:translate-x-1">
          {footer || 'View details'} <span aria-hidden="true">→</span>
        </div>
      </div>
    </button>
  )
}

function FeaturedEmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <p className="text-sm font-bold text-slate-500">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-xs font-black text-[#5472FC] transition-colors hover:bg-[#5472FC] hover:text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function FeaturedSection({ kicker, title, description, viewAllLabel, onViewAll, loading, items, renderItem, emptyMessage, emptyActionLabel, onEmptyAction }) {
  return (
    <Reveal as="section" className="border-t border-gray-200 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>{kicker}</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">{title}</h2>
          {description && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="group rounded-full border border-[#5472FC] bg-white px-5 py-2.5 text-xs font-black text-[#5472FC] transition-colors hover:bg-[#5472FC] hover:text-white"
        >
          {viewAllLabel} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 w-[280px] shrink-0 animate-pulse rounded-2xl border border-gray-100 bg-gray-50 sm:w-[300px]" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <CarouselRow>{items.map(renderItem)}</CarouselRow>
        ) : (
          <FeaturedEmptyState message={emptyMessage} actionLabel={emptyActionLabel} onAction={onEmptyAction} />
        )}
      </div>
    </Reveal>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <article className="break-inside-avoid rounded-[1.75rem] border border-white/80 bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,65,130,0.10)] sm:p-7">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.tone} text-xs font-black text-slate-800 ring-4 ring-white`}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight text-slate-950">{testimonial.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{testimonial.location}</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">{testimonial.text}</p>
    </article>
  )
}

const selectClass =
  'h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-slate-600 outline-none transition-colors focus:border-[#2551D9]'

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const role = user?.role || user?.accountType || 'student'
  // Recommendations (colleges/jobs/classes matched to a profile) are a student-only
  // concept -- an employer/college admin/instructor/admin has no studentProfile for
  // this to be computed from. Guests still see it as a preview of what signing up
  // as a student gets them.
  const isStudentView = !isAuthenticated || role === 'student'

  const [recommendations, setRecommendations] = useState(defaultStaticRecommendations)
  const [loadingRecs, setLoadingRecs] = useState(false)

  const [featured, setFeatured] = useState({ colleges: [], opportunities: [], classes: [] })
  const [stats, setStats] = useState({ colleges: null, opportunities: null, classes: null })
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  const [activeSearchTab, setActiveSearchTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [collegeCourse, setCollegeCourse] = useState('')
  const [collegeCity, setCollegeCity] = useState('')
  const [oppType, setOppType] = useState('')
  const [oppMode, setOppMode] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [classMode, setClassMode] = useState('')

  useEffect(() => {
    let isMounted = true

    if (isAuthenticated && isStudentView) {
      setLoadingRecs(true)

      api
        .getRecommendations('all')
        .then((response) => {
          if (!isMounted) return
          let items = response?.data || response
          if (Array.isArray(items)) {
            const formatted = items.map(formatRecommendationItem)
            setRecommendations(formatted)
          } else if (items && typeof items === 'object') {
            // Handle combined response object like { colleges: [], opportunities: [], classes: [] }
            const combined = [
              ...(items.colleges || []).map((c) => ({ ...c, collegeName: c.collegeName || c.title })),
              ...(items.opportunities || []).map((o) => ({ ...o, title: o.title })),
              ...(items.classes || []).map((cl) => ({ ...cl, classTitle: cl.classTitle || cl.title })),
            ]
            if (combined.length > 0) {
              setRecommendations(combined.map(formatRecommendationItem))
            } else {
              setRecommendations([])
            }
          } else {
            setRecommendations(defaultStaticRecommendations)
          }
        })
        .catch((err) => {
          console.warn('Failed to load recommendations:', err)
          if (isMounted) {
            setRecommendations(defaultStaticRecommendations)
          }
        })
        .finally(() => {
          if (isMounted) setLoadingRecs(false)
        })
    } else {
      setRecommendations(defaultStaticRecommendations)
      setLoadingRecs(false)
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, isStudentView])

  // Home page preview shows only the single best match per category (college,
  // job/internship, class); the full ranked list lives on the Matches page.
  const RECOMMENDATION_CATEGORY = {
    'College Match': 'college',
    'Internship Match': 'opportunity',
    'Job Match': 'opportunity',
    'Online Class': 'class',
  }
  const topRecommendations = []
  const seenCategories = new Set()
  for (const item of recommendations) {
    const category = RECOMMENDATION_CATEGORY[item.label] || item.label
    if (seenCategories.has(category)) continue
    seenCategories.add(category)
    topRecommendations.push(item)
  }
  // Backend computes matchPercentage per item from actual profile overlap (skills,
  // career interests, preferred courses/cities, etc. -- see recommendationService.js).
  // The badge shows the strongest of the displayed matches; undefined for guests,
  // since the demo data shown to them isn't a real computed match.
  const matchPercentages = topRecommendations
    .map((item) => item.matchPercentage)
    .filter((pct) => typeof pct === 'number')
  const bestMatchPercentage = matchPercentages.length ? Math.max(...matchPercentages) : null

  useEffect(() => {
    let isMounted = true
    setLoadingFeatured(true)

    Promise.allSettled([
      api.listColleges({ limit: 8, sortBy: 'rating', sortOrder: 'desc', approvalStatus: 'approved' }),
      api.listOpportunities({
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        approvalStatus: 'approved',
        status: 'active',
      }),
      api.listClasses({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc', approvalStatus: 'approved' }),
    ]).then(([collegesRes, opportunitiesRes, classesRes]) => {
      if (!isMounted) return

      setFeatured({
        colleges: collegesRes.status === 'fulfilled' ? collegesRes.value.data || [] : [],
        opportunities: opportunitiesRes.status === 'fulfilled' ? opportunitiesRes.value.data || [] : [],
        classes: classesRes.status === 'fulfilled' ? classesRes.value.data || [] : [],
      })
      setStats({
        colleges: collegesRes.status === 'fulfilled' ? (collegesRes.value.meta?.total ?? null) : null,
        opportunities: opportunitiesRes.status === 'fulfilled' ? (opportunitiesRes.value.meta?.total ?? null) : null,
        classes: classesRes.status === 'fulfilled' ? (classesRes.value.meta?.total ?? null) : null,
      })
      setLoadingFeatured(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())

    if (activeSearchTab === 0) {
      if (collegeCourse) params.set('course', collegeCourse)
      if (collegeCity) params.set('city', collegeCity)
      navigate(`/colleges?${params.toString()}`)
    } else if (activeSearchTab === 1) {
      if (oppType) params.set('type', oppType)
      if (oppMode) params.set('workMode', oppMode)
      navigate(`/jobs?${params.toString()}`)
    } else {
      if (classLevel) params.set('level', classLevel)
      if (classMode) params.set('mode', classMode)
      navigate(`/online-classes?${params.toString()}`)
    }
  }

  const handleQuickTag = (tag) => {
    const target = activeSearchTab === 0 ? '/colleges' : activeSearchTab === 1 ? '/jobs' : '/online-classes'
    navigate(`${target}?search=${encodeURIComponent(tag)}`)
  }

  const quickTags = activeSearchTab === 0 ? collegeTags : activeSearchTab === 1 ? opportunityTags : classTags

  return (
    <main className="overflow-x-hidden bg-white font-sans text-slate-950">
      {/* Hero -- bold dark banner with a floating white "course card"-style
          recommendation panel, inspired by edX's homepage hero. */}
      <section className="relative overflow-hidden bg-ink">
        <Blob className="-top-24 -right-16 h-72 w-72 animate-blob bg-[#5472FC]/25" />
        <Blob className="-bottom-28 -left-20 h-80 w-80 animate-blob animation-delay-2000 bg-[#5472FC]/10" />
        <Blob className="left-1/3 top-1/2 h-56 w-56 animate-blob animation-delay-4000 bg-violet-400/10" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:flex-row md:justify-between md:pb-24 md:pt-20 lg:px-10 xl:px-0">
          <Reveal className={`w-full text-left ${isStudentView ? 'max-w-[620px]' : 'max-w-2xl'}`}>
            <p className="mb-6 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#B8CAFF] ring-1 ring-white/20">
              Simple college-to-career platform
            </p>

            <h1 className="text-5xl font-black italic leading-[0.98] tracking-tight text-white sm:text-[58px]">
              One platform, your whole career path.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-[15px]">
              Discover colleges, compare programs, apply to jobs and internships, join online
              classes, and build your CV — everything a student needs, in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="rounded-full bg-[#5472FC] px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 focus:ring-offset-ink"
              >
                Explore Colleges
              </button>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="rounded-full border border-white/30 bg-transparent px-6 py-3.5 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-ink focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-ink"
              >
                {isAuthenticated ? 'My Profile' : 'Create Profile'}
              </button>
            </div>
          </Reveal>

          {isStudentView && (
            <Reveal
              delay={150}
              className="w-full max-w-[380px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40 transition-transform duration-300 hover:-translate-y-1"
            >
              <aside>
                <div className="h-1.5 bg-gradient-to-r from-[#5472FC] to-[#2551D9]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="inline-flex rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
                        {isAuthenticated ? 'Recommended for you' : 'Featured Matches'}
                      </p>
                      <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">Best matches</h2>
                    </div>
                    {bestMatchPercentage !== null && (
                      <div className="flex h-14 w-14 min-w-14 items-center justify-center rounded-2xl bg-[#E7EEFF] text-xl font-black text-[#2551D9]">
                        {bestMatchPercentage}%
                      </div>
                    )}
                  </div>

                  <p className="mt-4 rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-4 text-xs leading-5 text-slate-500">
                    {isAuthenticated
                      ? `Personalized recommendations for ${user?.firstName || 'you'} based on your profile & career interests.`
                      : 'Based on your interest in BCA, Python, Django, and internship opportunities.'}
                  </p>

                  <div className="mt-4 space-y-3">
                    {loadingRecs ? (
                      <div className="space-y-2 py-8 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#5472FC] border-t-transparent" />
                        <p className="text-xs font-semibold text-slate-400">Loading recommendations...</p>
                      </div>
                    ) : topRecommendations.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-xs font-bold text-slate-500">No recommendations found yet</p>
                        <p className="mt-1 text-[11px] text-slate-400">Complete your student profile to get personalized matches.</p>
                      </div>
                    ) : (
                      topRecommendations.map((item, index) => (
                        <div
                          key={item.id || `${item.title}-${index}`}
                          className={`flex gap-3 rounded-xl border bg-white p-3 ${
                            index === 0 ? 'border-[#B8CAFF]' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-lg bg-[#F8FAFC] text-[11px] font-black text-[#2551D9] ring-1 ring-gray-200">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] font-black text-[#2551D9]">{item.label}</p>
                              {typeof item.matchPercentage === 'number' && (
                                <span className="shrink-0 rounded-full bg-[#E7EEFF] px-2 py-0.5 text-[10px] font-black text-[#2551D9]">
                                  {item.matchPercentage}% match
                                </span>
                              )}
                            </div>
                            <h3 className="mt-0.5 text-sm font-black leading-snug text-slate-950">{item.title}</h3>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.meta}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(isAuthenticated ? '/matches' : '/login')}
                      className="rounded-xl bg-[#5472FC] px-4 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
                    >
                      {isAuthenticated ? 'View Matches' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                      className="rounded-xl border border-[#5472FC] bg-white px-4 py-3 text-xs font-black text-[#5472FC] transition-colors hover:bg-[#5472FC] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
                    >
                      {isAuthenticated ? 'Update Profile' : 'Sign Up'}
                    </button>
                  </div>
                </div>
              </aside>
            </Reveal>
          )}
        </div>
      </section>

      {/* Search -- bold gradient band holding a floating white search card,
          inspired by edX's "Find your learning path" banner. */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-br from-[#2551D9] via-[#3d5eea] to-[#5472FC] py-16 sm:py-20">
        <Blob className="-right-20 -top-20 h-72 w-72 animate-blob bg-white/10" />
        <Blob className="-bottom-24 left-10 h-64 w-64 animate-blob animation-delay-2000 bg-white/10" />
        <div className="relative mx-auto w-full max-w-6xl px-5 text-center sm:px-8 lg:px-10 xl:px-0">
          <Reveal>
            <SectionLabel tone="dark">Search</SectionLabel>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-[40px]">Find your path forward</h2>
            <p className="mt-3 text-sm text-white/75">
              Switch between college, job/internship, and online class search.
            </p>
          </Reveal>

          <Reveal delay={120} className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-4 text-left shadow-2xl">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex flex-wrap gap-7 border-b border-gray-200 pb-4">
                {searchTabs.map((tab, index) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSearchTab(index)}
                    className={`relative pb-2 text-xs font-black transition-colors ${
                      activeSearchTab === index ? 'text-[#5472FC]' : 'text-slate-600 hover:text-[#5472FC]'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`absolute -bottom-4.25 left-0 h-0.5 w-full rounded-full bg-[#5472FC] transition-transform duration-300 ${
                        activeSearchTab === index ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_200px_200px_auto]">
                <input
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2551D9]"
                  placeholder={searchPlaceholders[activeSearchTab]}
                />

                {activeSearchTab === 0 && (
                  <>
                    <select
                      aria-label="Course"
                      value={collegeCourse}
                      onChange={(e) => setCollegeCourse(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">All Courses</option>
                      {collegeTags.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="City"
                      value={collegeCity}
                      onChange={(e) => setCollegeCity(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">All Cities</option>
                      {collegeCityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {activeSearchTab === 1 && (
                  <>
                    <select aria-label="Type" value={oppType} onChange={(e) => setOppType(e.target.value)} className={selectClass}>
                      <option value="">All Types</option>
                      <option value="job">Job</option>
                      <option value="internship">Internship</option>
                    </select>
                    <select
                      aria-label="Work mode"
                      value={oppMode}
                      onChange={(e) => setOppMode(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Any Work Mode</option>
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </>
                )}

                {activeSearchTab === 2 && (
                  <>
                    <select
                      aria-label="Level"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <select
                      aria-label="Mode"
                      value={classMode}
                      onChange={(e) => setClassMode(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Any Mode</option>
                      <option value="live">Live</option>
                      <option value="recorded">Recorded</option>
                      <option value="self_paced">Self-paced</option>
                    </select>
                  </>
                )}

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-[#5472FC] px-5 text-xs font-black text-white shadow-sm shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Popular:</span>
                {quickTags.map((tag) => (
                  <Pill key={tag} onClick={() => handleQuickTag(tag)}>
                    {tag}
                  </Pill>
                ))}
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Stats -- big bold numbers on a dark band, inspired by edX's
          "100M / 84% / 140K / 42K" learner-outcomes section. */}
      <Reveal as="section" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-ink py-16 sm:py-20">
        <Blob className="left-1/2 top-0 h-72 w-72 -translate-x-1/2 animate-blob bg-[#5472FC]/15" />
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 text-center sm:grid-cols-3 sm:px-8 lg:px-10 xl:px-0">
          <StatBlock value={stats.colleges} label="Colleges listed" icon="graduation" />
          <StatBlock value={stats.opportunities} label="Jobs & internships" icon="briefcase" />
          <StatBlock value={stats.classes} label="Online classes" icon="laptop" />
        </div>
      </Reveal>

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 xl:px-0">
        <Reveal as="section" className="py-16 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_420px] md:items-center">
            <div>
              <SectionLabel>Student profile</SectionLabel>
              <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
                Personalized discovery for every student
              </h2>
              <p className="mt-5 max-w-[620px] text-sm leading-7 text-slate-500">
                Students can add education, skills, location preference, career interest, CV
                details, and portfolio. The platform can recommend better colleges and
                opportunities.
              </p>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="mt-5 rounded-full bg-[#5472FC] px-6 py-3 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#435DDE]"
              >
                {isAuthenticated ? 'Go to Profile' : 'Create Student Profile'}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2551D9] text-sm font-black text-white">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'S'}
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    {user ? `${user.firstName} ${user.lastName}` : 'Sample Student'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {user?.studentProfile?.currentCourse || 'BCA'} - {user?.studentProfile?.address || 'Kathmandu'}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(user?.studentProfile?.skills?.length
                  ? user.studentProfile.skills
                  : ['Python', 'Django', 'Internship', 'Remote']
                ).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <FeaturedSection
          kicker="Colleges"
          title="Featured colleges"
          description="Top-rated colleges with open admissions, picked from our full catalog."
          viewAllLabel="View all colleges"
          onViewAll={() => navigate('/colleges')}
          loading={loadingFeatured}
          items={featured.colleges}
          emptyMessage="New colleges are added every week - check back soon."
          emptyActionLabel="Browse all colleges"
          onEmptyAction={() => navigate('/colleges')}
          renderItem={(college) => (
            <FeaturedCard
              key={college._id}
              accent="blue"
              icon="graduation"
              kicker="College"
              onClick={() => navigate(`/colleges/${college._id}`)}
              badge={
                college.rating > 0 ? (
                  <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black text-amber-600">
                    {college.rating.toFixed(1)} ★
                  </span>
                ) : null
              }
              title={college.collegeName}
              subtitle={college.affiliation || 'Affiliated program'}
              metaItems={[
                { icon: 'pin', text: college.city || 'Nepal' },
                { icon: 'target', text: college.courses?.[0] || 'Multiple courses' },
              ]}
              footer="View details"
            />
          )}
        />

        <FeaturedSection
          kicker="Jobs and internships"
          title="Opportunities for students"
          description="Actively hiring roles from employers on EduPath, updated as they're posted."
          viewAllLabel="View all opportunities"
          onViewAll={() => navigate('/jobs')}
          loading={loadingFeatured}
          items={featured.opportunities}
          emptyMessage="New jobs and internships are posted regularly - check back soon."
          emptyActionLabel="Browse all opportunities"
          onEmptyAction={() => navigate('/jobs')}
          renderItem={(opportunity) => (
            <FeaturedCard
              key={opportunity._id}
              accent="emerald"
              icon="briefcase"
              kicker={opportunity.type === 'internship' ? 'Internship' : 'Job'}
              onClick={() => navigate(`/jobs/${opportunity._id}`)}
              badge={
                <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                  {opportunity.workMode || 'Onsite'}
                </span>
              }
              title={opportunity.title}
              subtitle={opportunity.companyName}
              metaItems={[
                { icon: 'pin', text: opportunity.location || opportunity.workMode || 'Remote' },
                { icon: 'clock', text: opportunity.stipendOrSalaryRange || 'Competitive' },
              ]}
              footer="View details"
            />
          )}
        />

        <FeaturedSection
          kicker="Online classes"
          title="Learn skills from anywhere"
          description="Live and recorded classes to build the skills employers and colleges look for."
          viewAllLabel="View all classes"
          onViewAll={() => navigate('/online-classes')}
          loading={loadingFeatured}
          items={featured.classes}
          emptyMessage="New online classes are added regularly - check back soon."
          emptyActionLabel="Browse all classes"
          onEmptyAction={() => navigate('/online-classes')}
          renderItem={(onlineClass) => (
            <FeaturedCard
              key={onlineClass._id}
              accent="violet"
              icon="laptop"
              kicker="Online Class"
              onClick={() => navigate(`/online-classes/${onlineClass._id}`)}
              badge={
                onlineClass.certificateAvailability ? (
                  <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black text-violet-700">Certificate</span>
                ) : null
              }
              title={onlineClass.classTitle}
              subtitle={onlineClass.instructorOrOrganization}
              metaItems={[
                { icon: 'clock', text: onlineClass.duration || 'Flexible' },
                { icon: 'target', text: onlineClass.level || 'All levels' },
              ]}
              footer={onlineClass.price ? `NPR ${onlineClass.price}` : 'Free'}
            />
          )}
        />
      </div>

      {/* Find your fit -- role cards on a tinted band, inspired by edX's
          "Find your perfect learning format" section. */}
      {!isAuthenticated && (
        <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-mist py-16 text-center sm:py-20">
          <Blob className="-left-24 -top-16 h-64 w-64 animate-blob bg-violet-300/15" />
          <Blob className="-bottom-20 -right-16 h-72 w-72 animate-blob animation-delay-2000 bg-[#5472FC]/10" />
          <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 xl:px-0">
            <Reveal>
              <SectionLabel>For every role</SectionLabel>
              <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
                Find your fit on EduPath
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {dashboardCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 90}>
                  <button
                    type="button"
                    onClick={() => navigate(card.getHref(isAuthenticated))}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(84,114,252,0.35)]"
                  >
                    <div className={`relative flex h-20 items-center justify-center bg-gradient-to-br ${categoryStyles[card.accent] || categoryStyles.blue}`}>
                      <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-800">
                        {card.tag}
                      </span>
                      <Icon name={card.icon} className="h-7 w-7 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-black text-slate-950 group-hover:text-[#2551D9]">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{card.text}</p>
                      <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-black text-[#5472FC] transition-transform duration-300 group-hover:translate-x-1">
                        Explore →
                      </span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 xl:px-0">
        {/* Popular topics -- chip grid, inspired by edX's "Popular topics" section. */}
        <Reveal as="section" className="border-t border-gray-200 py-16 text-center sm:py-20">
          <SectionLabel>Popular topics</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">Explore by topic</h2>
          <p className="mt-4 text-sm text-slate-500">Jump straight into what you're looking for.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {popularTopics.map((topic, index) => (
              <Reveal key={topic.label} delay={index * 40}>
                <button
                  type="button"
                  onClick={() => navigate(topic.target)}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-4 text-xs font-black text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9] hover:shadow-md"
                >
                  <Icon name="plus" className="h-3.5 w-3.5 text-[#5472FC] transition-transform duration-300 group-hover:rotate-90" />
                  {topic.label}
                </button>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="border-t border-gray-200 py-16 text-center sm:py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Three steps to your next opportunity
          </h2>
          <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            {howItWorksSteps.map((item, index) => (
              <Reveal
                key={item.step}
                delay={index * 120}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(84,114,252,0.35)]"
              >
                <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-[#5472FC] to-[#2551D9]">
                  <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#2551D9]">
                    Step {item.step}
                  </span>
                  <Icon name={item.icon} className="h-9 w-9 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_85%_12%,rgba(84,114,252,0.25),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(84,114,252,0.20),transparent_38%),linear-gradient(135deg,#ffffff_0%,#f4f6ff_50%,#ffffff_100%)] py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 xl:px-0">
            <div className="flex items-center justify-center gap-5 sm:gap-8">
              <svg className="hidden h-10 w-24 text-[#5472FC] sm:block" viewBox="0 0 100 40" fill="none" aria-hidden="true">
                <path d="M3 27c15-22 32-21 35-5 2 13-13 14-13 1 0-17 25-20 30-4 5 15-12 17-12 2 0-13 22-21 33-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5472FC]">Student stories</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
                  Hear From Our Beloved Students
                </h2>
              </div>
              <svg className="hidden h-10 w-24 -scale-x-100 text-[#5472FC] sm:block" viewBox="0 0 100 40" fill="none" aria-hidden="true">
                <path d="M3 27c15-22 32-21 35-5 2 13-13 14-13 1 0-17 25-20 30-4 5 15-12 17-12 2 0-13 22-21 33-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="mt-10 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3 lg:gap-6 lg:space-y-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA -- centered dark register banner, inspired by edX's
            "Register for a free account" closing section. */}
        <Reveal as="section" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-ink py-20 text-center sm:py-24">
          <Blob className="-top-20 left-1/2 h-72 w-72 -translate-x-1/2 animate-blob bg-[#5472FC]/20" />
          <Blob className="-bottom-24 right-1/4 h-64 w-64 animate-blob animation-delay-2000 bg-violet-400/10" />
          <div className="relative mx-auto w-full max-w-2xl px-5 sm:px-8">
            <h2 className="text-3xl font-black leading-tight text-white sm:text-[44px]">
              Ready to find your next step?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Colleges, jobs, internships, and online classes - matched to your profile, all in
              one free platform. Build your CV and apply without leaving EduPath.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="rounded-full bg-[#5472FC] px-7 py-3.5 text-xs font-black text-white shadow-lg shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE]"
              >
                {isAuthenticated ? 'View Profile' : 'Get Started Free'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-ink"
              >
                Explore Colleges
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  )
}

export default Home
