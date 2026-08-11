import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const inputBase =
  'w-full px-4 py-3 border rounded-xl text-sm font-sans bg-white/90 dark:bg-slate-900/90 dark:text-white transition-all focus:outline-none focus:ring-0'

const inputState = (error) =>
  error
    ? 'border-red-500 shadow-red-100 dark:shadow-red-900'
    : 'border-gray-200 dark:border-slate-700 focus:border-[#1F4FD8] focus:shadow-[0_0_0_3px_rgba(31,79,216,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(111,146,255,0.18)]'

const fieldLabel = 'text-sm font-medium text-gray-900 dark:text-white'
const errorText = 'text-red-500 text-xs'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'student',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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
    try {
      // TODO: Replace with actual API call
      console.log('Registering user:', formData)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccessMessage('Account created successfully! Redirecting to login...')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        accountType: 'student',
        agreeToTerms: false,
      })

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/70 shadow-2xl shadow-[#1F4FD8]/10 backdrop-blur sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.9fr,1.1fr] dark:border-slate-700 dark:bg-slate-950/80">
        <section className="flex min-h-full flex-col justify-between gap-8 bg-gradient-to-br from-[#EDF3FF] via-white to-[#DCE7FF] p-6 text-left sm:p-8 lg:p-12 dark:from-slate-900 dark:via-slate-950 dark:to-[#10245F]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#1F4FD8] dark:text-[#6F92FF]">EduPath</p>
            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl lg:text-6xl dark:text-white">
              Create your account and start planning with clarity.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-gray-600 sm:text-base dark:text-gray-300">
              Join as a student, parent, educator, or counselor and keep college discovery, career planning, and guidance in one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-xl border border-[#C9D7FF] bg-white/75 p-4 dark:border-[#1F4FD8]/50 dark:bg-slate-900/75">
              <p className="text-xs uppercase tracking-[0.24em] text-[#1F4FD8] dark:text-[#6F92FF]">Explore</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-gray-950 dark:text-white">
                Match your interests with colleges and majors
              </p>
            </div>
            <div className="rounded-xl border border-[#C9D7FF] bg-white/75 p-4 dark:border-[#1F4FD8]/50 dark:bg-slate-900/75">
              <p className="text-xs uppercase tracking-[0.24em] text-[#1F4FD8] dark:text-[#6F92FF]">Plan</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-gray-950 dark:text-white">
                Organize goals, decisions, and next steps
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-full items-center p-5 text-left sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-[#1F4FD8] dark:text-[#6F92FF]">EduPath</p>
            <h1 className="mt-3 mb-0 text-3xl font-semibold text-gray-950 sm:text-4xl dark:text-white">
              Create your account
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-400">
              Fill in your details to start your college and career discovery journey.
            </p>

            {successMessage && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                {successMessage}
              </div>
            )}
            {errors.submit && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className={fieldLabel}>First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="FName"
                  className={`${inputBase} ${inputState(errors.firstName)}`}
                />
                {errors.firstName && <span className={errorText}>{errors.firstName}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="lastName" className={fieldLabel}>Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="LName"
                  className={`${inputBase} ${inputState(errors.lastName)}`}
                />
                {errors.lastName && <span className={errorText}>{errors.lastName}</span>}
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
                <label htmlFor="accountType" className={fieldLabel}>Account Type</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className={`${inputBase} ${inputState(errors.accountType)} cursor-pointer appearance-none`}
                >
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="educator">Educator</option>
                  <option value="counselor">School Counselor</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className={fieldLabel}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className={`${inputBase} ${inputState(errors.password)}`}
                />
                {errors.password && <span className={errorText}>{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className={fieldLabel}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`${inputBase} ${inputState(errors.confirmPassword)}`}
                />
                {errors.confirmPassword && (
                  <span className={errorText}>{errors.confirmPassword}</span>
                )}
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-5 w-5 min-w-5 cursor-pointer accent-[#1F4FD8]"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="agreeToTerms" className="cursor-pointer text-sm font-normal leading-6 text-gray-600 dark:text-gray-400">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  {errors.agreeToTerms && <span className={errorText}>{errors.agreeToTerms}</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full cursor-pointer rounded-xl bg-[#5472FC] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#435DDE] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2 dark:bg-[#5472FC] dark:hover:bg-[#435DDE] dark:focus:ring-offset-slate-950"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-5 text-center dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#1F4FD8] transition-colors hover:text-[#183FB0] hover:underline dark:text-[#6F92FF] dark:hover:text-[#9DB4FF]">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register
