import { useEffect, useState } from 'react'
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

const howItWorksSteps = [
  {
    step: '01',
    title: 'Create your profile',
    text: 'Add your education, skills, and career interests so EduPath knows what to look for.',
  },
  {
    step: '02',
    title: 'Get matched instantly',
    text: 'See colleges, jobs, internships, and classes ranked by how well they fit you.',
  },
  {
    step: '03',
    title: 'Apply and grow',
    text: 'Send inquiries, submit applications, and build a CV - all without leaving EduPath.',
  },
]

const dashboardCards = [
  {
    title: 'Student',
    icon: '🎓',
    text: 'Saved colleges, saved jobs, applications, and profile.',
    getHref: (authed) => (authed ? '/profile' : '/register'),
  },
  {
    title: 'College',
    icon: '🏫',
    text: 'Profile, courses, inquiries, admission status, and analytics.',
    getHref: () => '/list-college',
  },
  {
    title: 'Employer',
    icon: '💼',
    text: 'Post jobs, view applicants, and shortlist students.',
    getHref: () => '/post-job',
  },
  {
    title: 'Instructor',
    icon: '📚',
    text: 'Post online classes, manage enrollments, and share learning materials.',
    getHref: () => '/post-class',
  },
  {
    title: 'CV Maker',
    icon: '📝',
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
    }
  }
  if (item.companyName || item.type) {
    return {
      id: item._id || item.id,
      label: item.type === 'internship' ? 'Internship Match' : 'Job Match',
      title: item.title,
      meta: `${item.companyName} - ${item.workMode || item.location || 'Onsite'} - ${item.stipendOrSalaryRange || 'Competitive'}`,
    }
  }
  if (item.classTitle) {
    return {
      id: item._id || item.id,
      label: 'Online Class',
      title: item.classTitle,
      meta: `${item.mode || 'Live class'} - ${item.duration || 'Flexible'} - ${item.certificateAvailability ? 'Certificate' : 'Course'}`,
    }
  }
  return {
    id: item._id || item.id,
    label: item.label || 'Recommendation',
    title: item.title || item.name || 'Recommended Item',
    meta: item.meta || item.description || '',
  }
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

function SectionLabel({ children }) {
  return (
    <p className="mb-4 inline-flex rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
      {children}
    </p>
  )
}

function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-8 text-center">
      {value === null ? (
        <span className="h-9 w-16 animate-pulse rounded-lg bg-gray-100 sm:h-10" />
      ) : (
        <span className="text-3xl font-black text-slate-950 sm:text-4xl">
          {value}
          {value >= 20 ? '+' : ''}
        </span>
      )}
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  )
}

function FeaturedCardShell({ onClick, badge, initials, title, subtitle, tags, footer }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-[#B8CAFF] hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EEFF] text-sm font-black text-[#2551D9]">
          {initials}
        </span>
        {badge}
      </div>
      <h3 className="mt-4 text-base font-black leading-snug text-slate-950 group-hover:text-[#2551D9]">
        {title}
      </h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto pt-5 text-xs font-black text-[#5472FC]">{footer || 'View details →'}</div>
    </button>
  )
}

function FeaturedEmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center sm:col-span-2 lg:col-span-3">
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

function FeaturedSection({ label, title, description, viewAllLabel, onViewAll, loading, items, renderItem, emptyMessage, emptyActionLabel, onEmptyAction }) {
  return (
    <section className="border-t border-gray-200 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">{title}</h2>
          {description && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-xs font-black text-[#5472FC] transition-colors hover:bg-[#5472FC] hover:text-white"
        >
          {viewAllLabel} →
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
            ))
          : items.length > 0
            ? items.map(renderItem)
            : (
              <FeaturedEmptyState message={emptyMessage} actionLabel={emptyActionLabel} onAction={onEmptyAction} />
            )}
      </div>
    </section>
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
          <p className="mt-1 text-[17px] leading-none tracking-[0.16em] text-amber-400" aria-label="5 out of 5 stars">
            ★★★★★
          </p>
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

    if (isAuthenticated) {
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
  }, [isAuthenticated])

  useEffect(() => {
    let isMounted = true
    setLoadingFeatured(true)

    Promise.allSettled([
      api.listColleges({ limit: 3, sortBy: 'rating', sortOrder: 'desc', approvalStatus: 'approved' }),
      api.listOpportunities({
        limit: 3,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        approvalStatus: 'approved',
        status: 'active',
      }),
      api.listClasses({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc', approvalStatus: 'approved' }),
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
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:flex-row md:justify-between md:pb-20 md:pt-20 lg:px-10 xl:px-0">
          <div className="w-full max-w-[620px] text-left">
            <p className="mb-6 inline-flex rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
              Simple college-to-career platform
            </p>

            <h1 className="text-5xl font-black leading-[0.98] tracking-normal text-slate-950 sm:text-[56px]">
              Find colleges, jobs, internships, online classes, and build your CV in one place.
            </h1>

            <p className="mt-6 text-sm leading-7 text-slate-500 sm:text-[15px]">
              A clean platform for students to discover colleges, compare programs, create a career
              profile, build a CV, apply for opportunities, and join online classes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
              >
                Start Exploring
              </button>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="rounded-xl border border-[#5472FC] bg-white px-5 py-3 text-xs font-black text-[#5472FC] shadow-sm transition-colors hover:bg-[#5472FC] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
              >
                {isAuthenticated ? 'My Profile' : 'Create Profile'}
              </button>
            </div>
          </div>

          <aside className="w-full max-w-[360px] shrink-0 rounded-2xl bg-white p-5 shadow-2xl shadow-slate-900/10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="inline-flex rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]">
                  {isAuthenticated ? 'Recommended for you' : 'Featured Matches'}
                </p>
                <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950">
                  Best matches
                </h2>
              </div>
              <div className="flex h-14 w-14 min-w-14 items-center justify-center rounded-2xl bg-[#E7EEFF] text-xl font-black text-[#2551D9]">
                94%
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-4 text-xs leading-5 text-slate-500">
              {isAuthenticated
                ? `Personalized recommendations for ${user?.firstName || 'you'} based on your profile & career interests.`
                : 'Based on your interest in BCA, Python, Django, and internship opportunities.'}
            </p>

            <div className="mt-4 space-y-3">
              {loadingRecs ? (
                <div className="py-8 text-center space-y-2">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#5472FC] border-t-transparent" />
                  <p className="text-xs text-slate-400 font-semibold">Loading recommendations...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-xs font-bold text-slate-500">No recommendations found yet</p>
                  <p className="mt-1 text-[11px] text-slate-400">Complete your student profile to get personalized matches.</p>
                </div>
              ) : (
                recommendations.map((item, index) => (
                  <div
                    key={item.id || `${item.title}-${index}`}
                    className={`flex gap-3 rounded-xl border bg-white p-3 ${
                      index === 0 ? 'border-[#B8CAFF]' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex h-7 w-7 min-w-7 items-center justify-center rounded-lg bg-[#F8FAFC] text-[11px] font-black text-[#2551D9] ring-1 ring-gray-200">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-[#2551D9]">{item.label}</p>
                      <h3 className="mt-0.5 text-sm font-black leading-snug text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.meta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
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
          </aside>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 xl:px-0">
        <section className="py-10">
          <div className="grid grid-cols-1 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatItem value={stats.colleges} label="Colleges listed" />
            <StatItem value={stats.opportunities} label="Jobs & internships" />
            <StatItem value={stats.classes} label="Online classes" />
          </div>
        </section>

        <section className="py-16 text-center">
          <SectionLabel>Search</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Discover what you need
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            Switch between college, job/internship, and online class search.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex flex-wrap gap-7 border-b border-gray-200 pb-4">
              {searchTabs.map((tab, index) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSearchTab(index)}
                  className={`text-xs font-black transition-colors ${
                    activeSearchTab === index ? 'text-[#5472FC]' : 'text-slate-600 hover:text-[#5472FC]'
                  }`}
                >
                  {tab.label}
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
                  <select
                    aria-label="Type"
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value)}
                    className={selectClass}
                  >
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
                className="h-11 rounded-xl bg-[#5472FC] px-5 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
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
        </section>

        <section className="border-t border-gray-200 py-16 sm:py-20">
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
                className="mt-5 rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
              >
                {isAuthenticated ? 'Go to Profile' : 'Create Student Profile'}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-6">
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
                  <span
                    key={tag}
                    className="rounded-full bg-[#E7EEFF] px-3 py-1.5 text-[11px] font-black text-[#2551D9]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FeaturedSection
          label="Colleges"
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
            <FeaturedCardShell
              key={college._id}
              onClick={() => navigate(`/colleges/${college._id}`)}
              initials={(college.collegeName || 'CG').slice(0, 2).toUpperCase()}
              badge={
                college.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-600">
                    ★ {college.rating.toFixed(1)}
                  </span>
                ) : null
              }
              title={college.collegeName}
              subtitle={`${college.city || ''}${college.affiliation ? ` • ${college.affiliation}` : ''}`}
              tags={college.courses}
            />
          )}
        />

        <FeaturedSection
          label="Jobs and internships"
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
            <FeaturedCardShell
              key={opportunity._id}
              onClick={() => navigate(`/jobs/${opportunity._id}`)}
              initials={(opportunity.companyName || 'CO').slice(0, 2).toUpperCase()}
              badge={
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-600">
                  {opportunity.type}
                </span>
              }
              title={opportunity.title}
              subtitle={`${opportunity.companyName || ''}${opportunity.location ? ` • ${opportunity.location}` : ''}`}
              tags={opportunity.requiredSkills}
            />
          )}
        />

        <FeaturedSection
          label="Online classes"
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
            <FeaturedCardShell
              key={onlineClass._id}
              onClick={() => navigate(`/online-classes/${onlineClass._id}`)}
              initials={(onlineClass.classTitle || 'CL').slice(0, 2).toUpperCase()}
              badge={
                onlineClass.certificateAvailability ? (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-600">
                    Certificate
                  </span>
                ) : null
              }
              title={onlineClass.classTitle}
              subtitle={`${onlineClass.instructorOrOrganization || ''}${onlineClass.level ? ` • ${onlineClass.level}` : ''}`}
              tags={onlineClass.subjects}
              footer={onlineClass.price ? `NPR ${onlineClass.price} • View details →` : 'Free • View details →'}
            />
          )}
        />

        <section className="border-t border-gray-200 py-16 text-center sm:py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Three steps to your next opportunity
          </h2>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {howItWorksSteps.map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span className="text-3xl font-black text-[#B8CAFF]">{item.step}</span>
                <h3 className="mt-3 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

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

        <section className="border-t border-gray-200 py-16 text-center sm:py-20">
          <SectionLabel>For every role</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Simple dashboards for each user
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {dashboardCards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => navigate(card.getHref(isAuthenticated))}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-[#B8CAFF] hover:shadow-lg"
              >
                <span className="text-2xl" aria-hidden="true">{card.icon}</span>
                <h3 className="mt-3 text-base font-black text-slate-950 group-hover:text-[#2551D9]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{card.text}</p>
                <span className="mt-auto pt-4 text-xs font-black text-[#5472FC]">Explore →</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <div className="grid gap-8 rounded-2xl bg-[#2551D9] px-8 py-10 text-white sm:px-9 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black leading-tight sm:text-[38px]">
                Ready to find your next step?
              </h2>
              <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/80">
                Colleges, jobs, internships, and online classes - matched to your profile, all in
                one free platform. Build your CV and apply without leaving EduPath.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
              >
                {isAuthenticated ? 'View Profile' : 'Get Started Free'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="rounded-xl border border-white/40 bg-transparent px-5 py-3 text-xs font-black text-white transition-colors hover:bg-white hover:text-[#2551D9]"
              >
                Explore Colleges
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
