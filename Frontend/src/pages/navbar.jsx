import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Discover', to: '/' },
  { label: 'Colleges', to: '/colleges' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Online Classes', to: '/online-classes' },
  { label: 'CV Maker', to: '/cv-maker' },
  { label: 'Profile', to: '/profile' },
]

function Navbar() {
  return (  
    <header className="w-full bg-[#F7F8FA]">
      <nav className="mx-auto box-border flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10 xl:px-0">
        <Link to="/" className="flex min-w-fit items-center gap-3 text-left">
          <span className="flex h-8 w-8 min-w-8 items-center justify-center rounded-lg bg-[#2551D9] text-sm font-black text-white">
            E
          </span>
          <span>
            <span className="block text-sm font-black leading-tight text-slate-950">
              EduPath
            </span>
            <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">
              College and Career Discovery
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-xs font-bold transition-colors hover:text-[#2551D9] ${
                  isActive ? 'text-[#2551D9]' : 'text-slate-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden min-w-fit items-center gap-3 lg:flex">
          <Link
            to="/list-college"
            className="rounded-xl border border-[#5472FC] bg-white px-4 py-2.5 text-xs font-black text-[#5472FC] shadow-sm transition-colors hover:bg-[#5472FC] hover:text-white"
          >
            List College
          </Link>
          <Link
            to="/post-job"
            className="rounded-xl bg-[#5472FC] px-4 py-2.5 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE]"
          >
            Post Job
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 lg:hidden">
          <Link
            to="/list-college"
            className="rounded-xl border border-[#5472FC] bg-white px-4 py-2 text-sm font-bold text-[#5472FC] shadow-sm"
          >
            List College
          </Link>
          <Link
            to="/post-job"
            className="rounded-xl bg-[#5472FC] px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            Post Job
          </Link>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap text-sm font-semibold transition-colors hover:text-[#2551D9] ${
                isActive ? 'text-[#2551D9]' : 'text-slate-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}

export default Navbar
