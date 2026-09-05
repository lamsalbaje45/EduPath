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

const searchTabs = ['Colleges', 'Jobs & Internships', 'Online Classes']
const collegeTags = ['BCA', 'BIT', 'BSc CSIT', 'BBA', 'Engineering']
const opportunityTags = ['Internship', 'Part-time', 'Remote', 'Python', 'Marketing', 'Robotics']
const classTags = ['Beginner', 'Live Classes', 'Recorded', 'Python', 'Marketing', 'Robotics']

const dashboardCards = [
  {
    title: 'Student',
    text: 'Saved colleges, saved jobs, applications, and profile.',
  },
  {
    title: 'College',
    text: 'Profile, courses, inquiries, admission status, and analytics.',
  },
  {
    title: 'Employer',
    text: 'Post jobs, view applicants, and shortlist students.',
  },
  {
    title: 'Instructor',
    text: 'Post online classes, manage enrollments, and share learning materials.',
  },
  {
    title: 'CV Maker',
    text: 'Students can build CVs and use them while applying for internships or jobs.',
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

function Pill({ children }) {
  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-950">
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

function EmptyFeatureSection({ label, title, tags }) {
  return (
    <section className="border-t border-gray-200 py-16 sm:py-20">
      <div className="flex items-start justify-between gap-5">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            {title}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="mt-12 rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-xs font-black text-[#5472FC] transition-colors hover:bg-[#5472FC] hover:text-white"
        >
          Clear
        </button>
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

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [recommendations, setRecommendations] = useState(defaultStaticRecommendations)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [recsError, setRecsError] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (isAuthenticated) {
      setLoadingRecs(true)
      setRecsError(null)

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
            setRecsError('Could not load live recommendations.')
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

  return (
    <main className="bg-white font-sans text-slate-950">
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
        <section className="py-16 text-center">
          <SectionLabel>Search</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Discover what you need
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            Switch between college search and job/internship search.
          </p>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm">
            <div className="flex flex-wrap gap-7 border-b border-gray-200 pb-4">
              {searchTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`text-xs font-black ${
                    index === 0 ? 'text-[#5472FC]' : 'text-slate-600 hover:text-[#5472FC]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_240px_240px_auto]">
              <input
                aria-label="Search college"
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2551D9]"
                placeholder="Search college, course, city..."
              />
              <select
                aria-label="Course"
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-slate-600 outline-none transition-colors focus:border-[#2551D9]"
                defaultValue="All Courses"
              >
                <option>All Courses</option>
                <option>BCA</option>
                <option>BIT</option>
                <option>BBA</option>
              </select>
              <select
                aria-label="City"
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-slate-600 outline-none transition-colors focus:border-[#2551D9]"
                defaultValue="All Cities"
              >
                <option>All Cities</option>
                <option>Kathmandu</option>
                <option>Pokhara</option>
                <option>Lalitpur</option>
              </select>
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="h-11 rounded-xl bg-[#5472FC] px-5 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
              >
                Search
              </button>
            </div>
          </div>
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

        <EmptyFeatureSection label="Colleges" title="Featured colleges" tags={collegeTags} />
        <EmptyFeatureSection
          label="Jobs and internships"
          title="Opportunities for students"
          tags={opportunityTags}
        />
        <EmptyFeatureSection
          label="Online classes"
          title="Learn skills from anywhere"
          tags={classTags}
        />

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

        <section className="py-16 text-center sm:py-20">
          <SectionLabel>Compare</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Compare selected colleges
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            Select up to 3 colleges to compare basic details.
          </p>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-5 py-8 text-sm font-semibold text-slate-400">
            No college selected for comparison.
          </div>
        </section>

        <section className="border-t border-gray-200 py-16 text-center sm:py-20">
          <SectionLabel>Dashboards</SectionLabel>
          <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-[40px]">
            Simple dashboards for each user
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {dashboardCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-gray-200 bg-white p-5 text-left">
                <h3 className="text-base font-black text-slate-950">{card.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-500">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <div className="grid gap-8 rounded-2xl bg-[#2551D9] px-8 py-10 text-white sm:px-9 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black leading-tight sm:text-[38px]">
                Ready to build the full platform?
              </h2>
              <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/80">
                This simple UI can be connected with Django, PostgreSQL, dashboards, online class
                management, and CV maker tools.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
                className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
              >
                {isAuthenticated ? 'View Profile' : 'Student Signup'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/post-job')}
                className="rounded-xl border border-[#5472FC] bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]"
              >
                Post Job
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
