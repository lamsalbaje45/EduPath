import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAssetUrl } from '../api/client'

const navItems = [
  { label: 'Discover', to: '/' },
  { label: 'Colleges', to: '/colleges' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Online Classes', to: '/online-classes' },
  { label: 'CV Maker', to: '/cv-maker' },
]

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const role = user?.role || user?.accountType || 'student'
  const isAdmin = role === 'admin'
  const isEmployer = role === 'employer'
  const isCollegeAdmin = role === 'college_admin'
  const isInstructor = role === 'instructor'
  // Colleges/Jobs/Online Classes/CV Maker are student-facing browse & tooling pages.
  // Guests (not yet signed in) still see them so they know what the platform offers,
  // but a signed-in employer/college admin/instructor/admin only needs their own
  // role's dashboard and posting tools, not the student browse experience.
  const isStudentView = !isAuthenticated || role === 'student'
  const visibleNavItems = isStudentView ? navItems : navItems.filter((item) => item.to === '/')

  // Close dropdown/mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const requestLogout = () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    setConfirmLogout(true)
  }

  const handleConfirmLogout = async () => {
    setConfirmLogout(false)
    await logout()
    navigate('/login')
  }

  const initials = user
    ? `${(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}${(
        user.lastName?.[0] || ''
      ).toUpperCase()}`
    : 'U'

  return (
    <header className="relative w-full bg-[#F7F8FA] border-b border-slate-200/80">
      <nav className="mx-auto box-border flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10 xl:px-0">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex min-w-fit items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-xl p-1"
        >
          <img src="/logo.png" alt="EduPath" className="h-9 w-auto sm:h-10" />
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-slate-600'
                }`
              }
            >
              Profile
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-purple-600 font-extrabold'
                }`
              }
            >
              Admin
            </NavLink>
          )}
          {isEmployer && (
            <NavLink
              to="/employer"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-emerald-600 font-extrabold'
                }`
              }
            >
              Employer
            </NavLink>
          )}
          {isCollegeAdmin && (
            <NavLink
              to="/college-admin"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-amber-600 font-extrabold'
                }`
              }
            >
              College Admin
            </NavLink>
          )}
          {isInstructor && (
            <NavLink
              to="/instructor"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-lg px-2 py-1 ${
                  isActive ? 'text-[#2551D9]' : 'text-pink-600 font-extrabold'
                }`
              }
            >
              Instructor
            </NavLink>
          )}
        </div>

        {/* Desktop Right Action Buttons / User Menu */}
        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          {isCollegeAdmin && (
            <Link
              to="/list-college"
              className="rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-xs font-black text-[#5472FC] shadow-sm transition-colors hover:bg-[#5472FC] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              List College
            </Link>
          )}
          {isEmployer && (
            <Link
              to="/post-job"
              className="rounded-xl bg-[#5472FC] px-4 py-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Post Job
            </Link>
          )}
          {isInstructor && (
            <Link
              to="/post-class"
              className="rounded-xl bg-[#5472FC] px-4 py-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Post Class
            </Link>
          )}

          {/* User Menu Dropdown */}
          {isAuthenticated ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-label="User account menu"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 shadow-sm transition-colors hover:border-[#5472FC] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
              >
                {user?.profileImage ? (
                  <img
                    src={getAssetUrl(user.profileImage)}
                    alt={`${user.firstName || 'User'} avatar`}
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7EEFF] text-xs font-black text-[#2551D9]">
                    {initials}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {user?.firstName || 'Account'}
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black text-[#2551D9] uppercase">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {isEmployer && (
                      <Link
                        to="/employer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                      >
                        Employer Dashboard
                      </Link>
                    )}
                    {isCollegeAdmin && (
                      <Link
                        to="/college-admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50"
                      >
                        College Admin Dashboard
                      </Link>
                    )}
                    {isInstructor && (
                      <Link
                        to="/instructor"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-pink-700 hover:bg-pink-50"
                      >
                        Instructor Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                    >
                      My Profile
                    </Link>
                    {isStudentView && (
                      <>
                        <Link
                          to="/applications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/cv-maker"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                        >
                          CV Maker
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={requestLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 lg:hidden" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-[#5472FC] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          {/* Collapsible mobile menu panel */}
          {mobileMenuOpen && (
            <div
              id="mobile-nav-menu"
              className="absolute left-0 right-0 top-full z-40 border-t border-slate-200/80 bg-white shadow-lg"
            >
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
                {visibleNavItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                        isActive ? 'bg-[#F6F8FF] text-[#2551D9]' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {isAuthenticated ? (
                  <>
                    <div className="my-2 border-t border-slate-100" />

                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                            isActive ? 'bg-purple-50 text-purple-700' : 'text-purple-600 hover:bg-purple-50'
                          }`
                        }
                      >
                        Admin Dashboard
                      </NavLink>
                    )}
                    {isEmployer && (
                      <>
                        <NavLink
                          to="/employer"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                              isActive ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-600 hover:bg-emerald-50'
                            }`
                          }
                        >
                          Employer Dashboard
                        </NavLink>
                        <Link
                          to="/post-job"
                          onClick={closeMobileMenu}
                          className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Post Job
                        </Link>
                      </>
                    )}
                    {isCollegeAdmin && (
                      <>
                        <NavLink
                          to="/college-admin"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                              isActive ? 'bg-amber-50 text-amber-700' : 'text-amber-600 hover:bg-amber-50'
                            }`
                          }
                        >
                          College Admin Dashboard
                        </NavLink>
                        <Link
                          to="/list-college"
                          onClick={closeMobileMenu}
                          className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          List College
                        </Link>
                      </>
                    )}
                    {isInstructor && (
                      <>
                        <NavLink
                          to="/instructor"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                              isActive ? 'bg-pink-50 text-pink-700' : 'text-pink-600 hover:bg-pink-50'
                            }`
                          }
                        >
                          Instructor Dashboard
                        </NavLink>
                        <Link
                          to="/post-class"
                          onClick={closeMobileMenu}
                          className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Post Class
                        </Link>
                      </>
                    )}

                    <NavLink
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                          isActive ? 'bg-[#F6F8FF] text-[#2551D9]' : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      My Profile
                    </NavLink>
                    {isStudentView && (
                      <NavLink
                        to="/applications"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                            isActive ? 'bg-[#F6F8FF] text-[#2551D9]' : 'text-slate-700 hover:bg-slate-50'
                          }`
                        }
                      >
                        My Applications
                      </NavLink>
                    )}

                    <div className="my-2 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={requestLogout}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-2 border-t border-slate-100" />
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="rounded-xl bg-[#5472FC] px-3 py-2.5 text-center text-sm font-black text-white shadow-sm transition-colors hover:bg-[#435DDE]"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">Sign out?</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to sign out of your account?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
