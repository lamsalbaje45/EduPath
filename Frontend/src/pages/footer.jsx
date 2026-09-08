import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const discoverLinks = [
  { label: 'Colleges', to: '/colleges' },
  { label: 'Jobs & Internships', to: '/jobs' },
  { label: 'Online Classes', to: '/online-classes' },
  { label: 'CV Maker', to: '/cv-maker' },
]

const partnerLinks = [
  { label: 'List a College', to: '/list-college' },
  { label: 'Post a Job', to: '/post-job' },
  { label: 'Post a Class', to: '/post-class' },
]

const linkClass = 'text-sm font-semibold text-slate-600 transition-colors hover:text-[#2551D9]'

function Footer() {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="border-t border-slate-200/80 bg-[#F7F8FA]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-10 xl:px-0">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="flex w-fit items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-xl p-1"
            >
              <span className="flex h-8 w-8 min-w-8 items-center justify-center rounded-lg bg-[#2551D9] text-sm font-black text-white shadow-sm">
                E
              </span>
              <span className="text-sm font-black leading-tight text-slate-950">EduPath</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              A simple college-to-career platform: discover colleges, find jobs and internships,
              join online classes, and build your CV - all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Discover</h3>
            <ul className="mt-4 space-y-3">
              {discoverLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">For Partners</h3>
            <ul className="mt-4 space-y-3">
              {partnerLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Account</h3>
            <ul className="mt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" className={linkClass}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/applications" className={linkClass}>
                      My Applications
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={linkClass}>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className={linkClass}>
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs font-semibold text-slate-400">
            © {new Date().getFullYear()} EduPath. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-slate-400">
            Built for students, colleges, employers, and instructors.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
