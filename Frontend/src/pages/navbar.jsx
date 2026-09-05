import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  const dropdownRef = useRef(null)

  const role = user?.role || user?.accountType || 'student'
  const isAdmin = role === 'admin'
  const isEmployer = role === 'employer'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  const initials = user
    ? `${(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}${(
        user.lastName?.[0] || ''
      ).toUpperCase()}`
    : 'U'

  return (
    <header className="w-full bg-[#F7F8FA] border-b border-slate-200/80">
      <nav className="mx-auto box-border flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10 xl:px-0">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex min-w-fit items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 rounded-xl p-1"
        >
          <span className="flex h-8 w-8 min-w-8 items-center justify-center rounded-lg bg-[#2551D9] text-sm font-black text-white shadow-sm">
            E
          </span>
          <span>
            <span className="block text-sm font-black leading-tight text-slate-950">
              EduPath
            </span>
            <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">
              College & Career Discovery
            </span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
          {navItems.map((item) => (
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
        </div>

        {/* Desktop Right Action Buttons / User Menu */}
        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          <Link
            to="/list-college"
            className="rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-xs font-black text-[#5472FC] shadow-sm transition-colors hover:bg-[#5472FC] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
          >
            List College
          </Link>
          <Link
            to="/post-job"
            className="rounded-xl bg-[#5472FC] px-4 py-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
          >
            Post Job
          </Link>

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
                    src={user.profileImage}
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
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    {isEmployer && (
                      <Link
                        to="/employer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                      >
                        💼 Employer Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/applications"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                    >
                      📄 My Applications
                    </Link>
                    <Link
                      to="/cv-maker"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#F6F8FF] hover:text-[#2551D9]"
                    >
                      📝 CV Maker
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      ➔ Sign out
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
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7EEFF] text-xs font-black text-[#2551D9]"
              aria-label="View Profile"
            >
              {initials}
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-[#5472FC] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Sub-Nav Scroll Bar */}
      <div className="mx-auto flex w-full max-w-6xl gap-4 overflow-x-auto px-5 pb-3 sm:px-8 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap text-xs font-bold transition-colors hover:text-[#2551D9] ${
                isActive ? 'text-[#2551D9]' : 'text-slate-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        {isAuthenticated && (
          <>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `whitespace-nowrap text-xs font-bold transition-colors ${
                    isActive ? 'text-[#2551D9]' : 'text-purple-600 font-bold'
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
                  `whitespace-nowrap text-xs font-bold transition-colors ${
                    isActive ? 'text-[#2551D9]' : 'text-emerald-600 font-bold'
                  }`
                }
              >
                Employer
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `whitespace-nowrap text-xs font-bold transition-colors ${
                  isActive ? 'text-[#2551D9]' : 'text-slate-600'
                }`
              }
            >
              Profile
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) =>
                `whitespace-nowrap text-xs font-bold transition-colors ${
                  isActive ? 'text-[#2551D9]' : 'text-slate-600'
                }`
              }
            >
              Applications
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
