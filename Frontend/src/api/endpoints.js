/**
 * API Endpoints - High-level resource functions
 * Real endpoints fetch from backend; stub endpoints fallback to mockAdapter
 * Each stub-backed endpoint tries real call first, catches "route group" message, falls back to mock
 */

import apiClient from './client'
import mockAdapter from './mockAdapter'

/**
 * Check if response is a stub "route group" placeholder
 * Stub responses have: { success: true, message: "X route group", routes: [...] }
 */
const isStubResponse = (data) => {
  return data?.success === true && data?.routes && Array.isArray(data.routes) && !data.data
}

/**
 * REAL ENDPOINTS (fully implemented in backend)
 */

export const getAuth = async () => {
  try {
    return await apiClient.get('/auth')
  } catch (error) {
    console.error('Failed to fetch auth overview:', error)
    throw error
  }
}

export const getMe = async () => {
  try {
    return await apiClient.get('/auth/me')
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    throw error
  }
}

export const listColleges = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    return await apiClient.get(`/colleges${query ? `?${query}` : ''}`)
  } catch (error) {
    console.error('Failed to fetch colleges:', error)
    throw error
  }
}

export const listClasses = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    return await apiClient.get(`/classes${query ? `?${query}` : ''}`)
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    throw error
  }
}

export const listOpportunities = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    return await apiClient.get(`/opportunities${query ? `?${query}` : ''}`)
  } catch (error) {
    console.error('Failed to fetch opportunities:', error)
    throw error
  }
}

export const getRecommendations = async (type, params = {}) => {
  try {
    let endpoint = '/recommendations'
    if (type === 'opportunities') endpoint += '/opportunities'
    else if (type === 'colleges') endpoint += '/colleges'
    else if (type === 'classes') endpoint += '/classes'
    else if (type === 'all') endpoint += '/all'
    
    const query = new URLSearchParams(params).toString()
    return await apiClient.get(`${endpoint}${query ? `?${query}` : ''}`)
  } catch (error) {
    console.error(`Failed to fetch recommendations (${type}):`, error)
    throw error
  }
}

/**
 * STUB-BACKED ENDPOINTS (fallback to mockAdapter when backend returns "route group")
 * Each tries real API first, catches "route group" error, falls back to mock
 */

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password })
    // If it's a stub, fall back to mock
    if (isStubResponse(response)) {
      console.warn('[API] /auth/login is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.login(email, password)
    }
    return response
  } catch (error) {
    // If endpoint doesn't exist or stub response, use mock
    console.warn('[API] login failed, falling back to mock adapter:', error.message)
    return await mockAdapter.login(email, password)
  }
}

export const register = async (firstName, lastName, email, password, accountType = 'student') => {
  try {
    const response = await apiClient.post('/auth/register', { firstName, lastName, email, password, accountType })
    if (isStubResponse(response)) {
      console.warn('[API] /auth/register is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.register(firstName, lastName, email, password, accountType)
    }
    return response
  } catch (error) {
    console.warn('[API] register failed, falling back to mock adapter:', error.message)
    return await mockAdapter.register(firstName, lastName, email, password, accountType)
  }
}

export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout', {})
    if (isStubResponse(response)) {
      console.warn('[API] /auth/logout is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.logout()
    }
    return response
  } catch (error) {
    console.warn('[API] logout failed, falling back to mock adapter:', error.message)
    return await mockAdapter.logout()
  }
}

export const getApplications = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    const response = await apiClient.get(`/applications${query ? `?${query}` : ''}`)
    if (isStubResponse(response)) {
      console.warn('[API] /applications is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.getApplications(params)
    }
    return response
  } catch (error) {
    console.warn('[API] getApplications failed, falling back to mock adapter:', error.message)
    return await mockAdapter.getApplications(params)
  }
}

export const createApplication = async (opportunityId, message = '') => {
  try {
    const response = await apiClient.post('/applications', { opportunityId, message })
    if (isStubResponse(response)) {
      console.warn('[API] POST /applications is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createApplication(opportunityId, message)
    }
    return response
  } catch (error) {
    console.warn('[API] createApplication failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createApplication(opportunityId, message)
  }
}

export const getInquiries = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    const response = await apiClient.get(`/inquiries${query ? `?${query}` : ''}`)
    if (isStubResponse(response)) {
      console.warn('[API] /inquiries is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.getInquiries(params)
    }
    return response
  } catch (error) {
    console.warn('[API] getInquiries failed, falling back to mock adapter:', error.message)
    return await mockAdapter.getInquiries(params)
  }
}

export const createInquiry = async (collegeId, message) => {
  try {
    const response = await apiClient.post('/inquiries', { collegeId, message })
    if (isStubResponse(response)) {
      console.warn('[API] POST /inquiries is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createInquiry(collegeId, message)
    }
    return response
  } catch (error) {
    console.warn('[API] createInquiry failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createInquiry(collegeId, message)
  }
}

export const getCv = async () => {
  try {
    const response = await apiClient.get('/cv')
    if (isStubResponse(response)) {
      console.warn('[API] GET /cv is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.getCv()
    }
    return response
  } catch (error) {
    console.warn('[API] getCv failed, falling back to mock adapter:', error.message)
    return await mockAdapter.getCv()
  }
}

export const saveCv = async (cvData) => {
  try {
    const response = await apiClient.put('/cv', cvData)
    if (isStubResponse(response)) {
      console.warn('[API] PUT /cv is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.saveCv(cvData)
    }
    return response
  } catch (error) {
    console.warn('[API] saveCv failed, falling back to mock adapter:', error.message)
    return await mockAdapter.saveCv(cvData)
  }
}

export const getUsers = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString()
    const response = await apiClient.get(`/users${query ? `?${query}` : ''}`)
    if (isStubResponse(response)) {
      console.warn('[API] /users is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.getUsers(params)
    }
    return response
  } catch (error) {
    console.warn('[API] getUsers failed, falling back to mock adapter:', error.message)
    return await mockAdapter.getUsers(params)
  }
}

export default {
  getAuth,
  getMe,
  listColleges,
  listClasses,
  listOpportunities,
  getRecommendations,
  login,
  register,
  logout,
  getApplications,
  createApplication,
  getInquiries,
  createInquiry,
  getCv,
  saveCv,
  getUsers,
}
