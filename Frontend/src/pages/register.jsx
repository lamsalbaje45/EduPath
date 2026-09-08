import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Blob, Reveal, SectionLabel } from '../components/ui/design'

const inputBase =
  'w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white transition-all focus:outline-none focus:ring-0'

const inputState = (error) =>
  error
    ? 'border-red-500 shadow-red-100'
    : 'border-gray-200 focus:border-[#2551D9] focus:shadow-[0_0_0_3px_rgba(37,81,217,0.12)]'

const fieldLabel = 'text-sm font-bold text-slate-950'
const errorText = 'text-red-500 text-xs'
const hintText = 'text-slate-500 text-xs'

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

const PASSWORD_REQUIREMENTS = [
  { test: (v) => v.length >= 8, message: 'At least 8 characters long' },
  { test: (v) => /[A-Z]/.test(v), message: 'One uppercase letter (A-Z)' },
  { test: (v) => /[a-z]/.test(v), message: 'One lowercase letter (a-z)' },
  { test: (v) => /[0-9]/.test(v), message: 'One digit (0-9)' },
  { test: (v) => /[!@#$%^&*]/.test(v), message: 'One special character (!@#$%^&*)' },
]

const getPasswordErrors = (password) =>
  PASSWORD_REQUIREMENTS.filter((rule) => !rule.test(password)).map((rule) => rule.message)

const highlights = [
  { label: 'Explore', text: 'Match your interests with colleges, majors, and programs.' },
  { label: 'Plan', text: 'Track goals, applications, and next steps in one place.' },
]

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordErrors = getPasswordErrors(formData.password)
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.role
      )

      setSuccessMessage('Account created successfully! Redirecting...')
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        agreeToTerms: false,
      })

      setTimeout(() => {
        navigate(location.state?.from || '/')
      }, 1200)
    } catch (err) {
      console.error('Registration error:', err)
      const fieldErrors = {}
      if (Array.isArray(err?.errors)) {
        err.errors.forEach(({ field, message }) => {
          if (!field) return
          fieldErrors[field] = fieldErrors[field]
            ? [...fieldErrors[field], message]
            : [message]
        })
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: err?.message || 'An error occurred during registration. Please try again.' })
      }
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
            <SectionLabel tone="dark">Join EduPath</SectionLabel>
            <h1 className="max-w-lg text-4xl font-black italic leading-[1.05] text-white sm:text-5xl">
              Plan your path with clarity.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              Join as a student, college, employer, or instructor and keep discovery, applications, and
              guidance in one place.
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
              <span className="border-b-2 border-[#5472FC] pb-3 text-sm font-black text-[#2551D9]">Register</span>
              <Link to="/login" className="pb-3 text-sm font-black text-slate-400 transition-colors hover:text-slate-600">
                Sign in
              </Link>
            </div>

            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Fill in your details to start your college and career journey.</p>

            {successMessage && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {successMessage}
              </div>
            )}
            {errors.submit && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className={fieldLabel}>Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`${inputBase} ${inputState(errors.fullName)}`}
                />
                {errors.fullName && <span className={errorText}>{errors.fullName}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={fieldLabel}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@edupath.com"
                  className={`${inputBase} ${inputState(errors.email)}`}
                />
                {errors.email && <span className={errorText}>{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="role" className={fieldLabel}>Account Type</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputBase} ${inputState(errors.role)} cursor-pointer appearance-none`}
                >
                  <option value="student">Student</option>
                  <option value="college_admin">College Admin</option>
                  <option value="employer">Employer</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className={fieldLabel}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
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
                  {errors.password ? (
                    Array.isArray(errors.password) ? (
                      <ul className={`${errorText} list-disc space-y-0.5 pl-4`}>
                        {errors.password.map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className={errorText}>{errors.password}</span>
                    )
                  ) : (
                    <span className={hintText}>Uppercase, lowercase, a digit, and a symbol</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className={fieldLabel}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={`${inputBase} ${inputState(errors.confirmPassword)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <PasswordVisibilityIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={errorText}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-5 w-5 min-w-5 cursor-pointer accent-[#5472FC]"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="agreeToTerms" className="cursor-pointer text-sm font-medium leading-6 text-slate-600">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  {errors.agreeToTerms && <span className={errorText}>{errors.agreeToTerms}</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full cursor-pointer rounded-full bg-[#5472FC] px-6 py-3.5 text-sm font-black text-white shadow-sm shadow-[#5472FC]/30 transition-all hover:-translate-y-0.5 hover:bg-[#435DDE] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

export default Register
