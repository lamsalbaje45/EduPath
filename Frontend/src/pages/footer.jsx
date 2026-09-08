import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const discoverLinks = [
  { label: 'Colleges', to: '/colleges' },
  { label: 'Jobs & Internships', to: '/jobs' },
  { label: 'Online Classes', to: '/online-classes' },
  { label: 'CV Maker', to: '/cv-maker' },
]

// Each partner link is scoped to the role that owns it, so a signed-in employer only
// sees "Post a Job", not the college/instructor partner tools that aren't theirs to use.
const partnerLinks = [
  { label: 'List a College', to: '/list-college', role: 'college_admin' },
  { label: 'Post a Job', to: '/post-job', role: 'employer' },
  { label: 'Post a Class', to: '/post-class', role: 'instructor' },
]

const linkClass = 'text-sm font-semibold text-slate-600 transition-colors hover:text-[#2551D9]'

function Footer() {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role || user?.accountType || 'student'
  // Guests see the full Discover set as a preview of the platform; a signed-in
  // non-student role (employer/college admin/instructor/admin) only needs their own
  // dashboard and posting tools, not the student browse pages.
  const isStudentView = !isAuthenticated || role === 'student'
  const visiblePartnerLinks =
    !isAuthenticated || role === 'admin'
      ? partnerLinks
      : partnerLinks.filter((link) => link.role === role)

  return (
    <footer className="border-t border-slate-200/80 bg-[#F7F8FA]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-10 xl:px-0">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="flex w-fit items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-xl p-1"
            >
              <img src="/logo.png" alt="EduPath" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              A simple college-to-career platform: discover colleges, find jobs and internships,
              join online classes, and build your CV - all in one place.
            </p>
          </div>

          {isStudentView && (
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
          )}

          {visiblePartnerLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">For Partners</h3>
              <ul className="mt-4 space-y-3">
                {visiblePartnerLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                  {isStudentView && (
                    <li>
                      <Link to="/applications" className={linkClass}>
                        My Applications
                      </Link>
                    </li>
                  )}
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
