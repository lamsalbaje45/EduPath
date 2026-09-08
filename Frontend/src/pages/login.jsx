import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Blob, Reveal, SectionLabel } from '../components/ui/design'

const inputBase = 'w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white transition-all focus:outline-none focus:ring-0'
const inputState = (error) => error
  ? 'border-red-500 shadow-red-100'
  : 'border-gray-200 focus:border-[#2551D9] focus:shadow-[0_0_0_3px_rgba(37,81,217,0.12)]'
const fieldLabel = 'text-sm font-bold text-slate-950'
const errorText = 'text-red-500 text-xs'

function PasswordVisibilityIcon({ visible }) {
  return visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const highlights = [
  { label: 'Discover', text: 'Colleges, jobs, internships, and classes matched to you.' },
  { label: 'Track', text: 'Applications, saved items, and your CV in one dashboard.' },
]

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!formData.email.trim()) nextErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Please enter a valid email address'
    if (!formData.password) nextErrors.password = 'Password is required'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      await login(formData.email, formData.password)
      setSuccessMessage('Signed in successfully!')
      setTimeout(() => navigate(location.state?.from || '/'), 800)
    } catch (err) {
      console.error('Login error:', err)
      setErrors({ submit: err?.message || 'Invalid email or password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#5472FC] via-violet-500 to-emerald-500" />

      <div className="grid min-h-[calc(100vh-6px)] lg:grid-cols-[1fr_1.15fr]">
        {/* Left -- dark brand panel, hidden on small screens */}
        <section className="relative hidden overflow-hidden bg-ink px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-16">
          <Blob className="-right-16 -top-16 h-72 w-72 animate-blob bg-[#5472FC]/25" />
          <Blob className="-bottom-24 -left-16 h-80 w-80 animate-blob animation-delay-2000 bg-violet-500/15" />

          <Link to="/" className="relative inline-flex w-fit rounded-xl bg-white/95 px-3 py-2 shadow-lg">
            <img src="/logo.png" alt="EduPath" className="h-8 w-auto" />
          </Link>

          <div className="relative">
            <SectionLabel tone="dark">Welcome back</SectionLabel>
            <h1 className="max-w-lg text-4xl font-black italic leading-[1.05] text-white sm:text-5xl">
              Pick up right where you left off.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              Sign in to continue your college and career discovery journey with EduPath.
            </p>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/15">
                <p className="text-[11px] font-black uppercase tracking-wide text-[#B8CAFF]">{item.label}</p>
                <p className="mt-2 text-sm font-semibold leading-snug text-white">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right -- form panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
          <Reveal className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex lg:hidden">
              <img src="/logo.png" alt="EduPath" className="h-9 w-auto" />
            </Link>

            <div className="mb-8 flex gap-6 border-b border-gray-200">
              <Link to="/register" className="pb-3 text-sm font-black text-slate-400 transition-colors hover:text-slate-600">
                Register
              </Link>
              <span className="border-b-2 border-[#5472FC] pb-3 text-sm font-black text-[#2551D9]">Sign in</span>
            </div>

            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue your college and career discovery journey.</p>

            {successMessage && <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{successMessage}</div>}
            {errors.submit && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errors.submit}</div>}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={fieldLabel}>Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" className={`${inputBase} ${inputState(errors.email)}`} />
                {errors.email && <span className={errorText}>{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="password" className={fieldLabel}>Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#2551D9] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className={`${inputBase} ${inputState(errors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <PasswordVisibilityIcon visible={showPassword} />
                  </button>
                </div>
                {errors.password && <span className={errorText}>{errors.password}</span>}
              </div>

              <div className="flex items-center gap-3">
                <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="h-5 w-5 min-w-5 cursor-pointer accent-[#5472FC]" />
                <label htmlFor="rememberMe" className="cursor-pointer text-sm font-medium text-slate-600">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 cursor-pointer rounded-full bg-[#5472FC] px-6 py-3.5 text-sm font-black text-white shadow-sm shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

export default Login
