/**
 * AuthContext - Global authentication state
 * Provides: user, token, login(), register(), logout(), isAuthenticated, loading
 * On mount, hydrates user from localStorage token via getMe()
 */

import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api/endpoints'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hydrate user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      setError(null)
      
      const storedToken = localStorage.getItem('edupath_token')
      
      if (storedToken) {
        setToken(storedToken)
        try {
          const response = await api.getMe()
          // Handle both real response and mock response formats
          const userData = response.user || response.data
          setUser(userData)
        } catch (err) {
          console.error('Failed to hydrate user:', err)
          // Token exists but user fetch failed - clear both
          localStorage.removeItem('edupath_token')
          setToken(null)
          setUser(null)
          setError(err?.message || 'Failed to load user')
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.login(email, password)
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      
      // Handle both real response and mock response formats
      const userData = response.user || response.data?.user || response.data
      const userToken = response.data?.token || response.token
      
      if (!userToken) {
        throw new Error('No token received from login')
      }
      
      localStorage.setItem('edupath_token', userToken)
      setToken(userToken)
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (err) {
      const errorMessage = err?.message || err?.status || 'Login failed'
      setError(errorMessage)
      console.error('Login error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (firstName, lastName, email, password, accountType = 'student') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.register(firstName, lastName, email, password, accountType)
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed')
      }
      
      // Handle both real response and mock response formats
      const userData = response.user || response.data?.user || response.data
      const userToken = response.data?.token || response.token
      
      if (!userToken) {
        throw new Error('No token received from registration')
      }
      
      localStorage.setItem('edupath_token', userToken)
      setToken(userToken)
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (err) {
      const errorMessage = err?.message || err?.status || 'Registration failed'
      setError(errorMessage)
      console.error('Register error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if API fails
    } finally {
      localStorage.removeItem('edupath_token')
      setToken(null)
      setUser(null)
      setLoading(false)
    }
  }

  const isAuthenticated = !!token && !!user

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
