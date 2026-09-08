import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputBase = 'w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white/90 dark:bg-slate-900/90 dark:text-white transition-all focus:outline-none focus:ring-0'
const inputState = (error) => error
  ? 'border-red-500 shadow-red-100 dark:shadow-red-900'
  : 'border-gray-200 dark:border-slate-700 focus:border-[#1F4FD8] focus:shadow-[0_0_0_3px_rgba(31,79,216,0.12)]'
const fieldLabel = 'text-sm font-medium text-gray-900 dark:text-white'
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
      // TODO: POST /auth/login will be called via login() once backend adds endpoint
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
    <div className="flex min-h-screen items-center justify-center bg-white p-5 sm:p-8 lg:p-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[2rem] border border-gray-200/80 bg-white/70 p-8 shadow-2xl shadow-[#1F4FD8]/10 backdrop-blur sm:p-12 dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.32em] text-[#1F4FD8] dark:text-[#6F92FF]">EduPath</p>
          <h1 className="mb-3 text-3xl font-semibold text-gray-950 dark:text-white">Welcome Back</h1>
          <p className="text-base text-gray-600 dark:text-gray-400">Sign in to continue your college and career discovery journey</p>
        </div>

        {successMessage && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{successMessage}</div>}
        {errors.submit && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={fieldLabel}>Email Address</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" className={`${inputBase} ${inputState(errors.email)}`} />
            {errors.email && <span className={errorText}>{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="password" className={fieldLabel}>Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-[#1F4FD8] hover:underline">Forgot password?</Link>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <PasswordVisibilityIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && <span className={errorText}>{errors.password}</span>}
          </div>

          <div className="flex items-center gap-3">
            <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="h-5 w-5 min-w-5 cursor-pointer accent-[#1F4FD8]" />
            <label htmlFor="rememberMe" className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">Remember me</label>
          </div> 

          <button type="submit" disabled={isLoading} className="mt-3 cursor-pointer rounded-xl bg-[#5472FC] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#435DDE] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#5472FC] dark:hover:bg-[#435DDE] dark:focus:ring-offset-slate-950">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-5 text-center dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[#1F4FD8] hover:underline">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
