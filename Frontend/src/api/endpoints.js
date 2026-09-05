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

export const updateProfile = async (userId, profileData) => {
  try {
    // TODO: switch to PATCH /users/:id or PATCH /students/:id once backend adds endpoint
    const response = await apiClient.patch(`/users/${userId}`, profileData)
    if (isStubResponse(response)) {
      return await mockAdapter.updateProfile(userId, profileData)
    }
    return response
  } catch (error) {
    console.warn('[API] updateProfile failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateProfile(userId, profileData)
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
    if (isStubResponse(response)) {
      console.warn('[API] /auth/login is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.login(email, password)
    }
    return response
  } catch (error) {
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

export const createApplication = async (application, legacyMessage = '') => {
  const payload = typeof application === 'string'
    ? { opportunityId: application, coverMessage: legacyMessage }
    : application

  try {
    const response = await apiClient.post('/applications', payload)
    if (isStubResponse(response)) {
      console.warn('[API] POST /applications is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createApplication(payload)
    }
    return response
  } catch (error) {
    console.warn('[API] createApplication failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createApplication(payload)
  }
}

export const withdrawApplication = async (id) => {
  try {
    const response = await apiClient.delete(`/applications/${id}`)
    if (isStubResponse(response)) {
      console.warn('[API] DELETE /applications/:id is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.withdrawApplication(id)
    }
    return response
  } catch (error) {
    console.warn('[API] withdrawApplication failed, falling back to mock adapter:', error.message)
    return await mockAdapter.withdrawApplication(id)
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

export const createInquiry = async (collegeIdOrPayload, message) => {
  const payload = typeof collegeIdOrPayload === 'object' && collegeIdOrPayload !== null
    ? collegeIdOrPayload
    : { collegeId: collegeIdOrPayload, message }

  try {
    const response = await apiClient.post('/inquiries', payload)
    if (isStubResponse(response)) {
      console.warn('[API] POST /inquiries is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createInquiry(payload)
    }
    return response
  } catch (error) {
    console.warn('[API] createInquiry failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createInquiry(payload)
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

export const createCollege = async (collegeData) => {
  try {
    const response = await apiClient.post('/colleges', collegeData)
    if (isStubResponse(response)) {
      console.warn('[API] POST /colleges is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createCollege(collegeData)
    }
    return response
  } catch (error) {
    console.warn('[API] createCollege failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createCollege(collegeData)
  }
}

export const createOpportunity = async (opportunityData) => {
  try {
    const response = await apiClient.post('/opportunities', opportunityData)
    if (isStubResponse(response)) {
      console.warn('[API] POST /opportunities is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.createOpportunity(opportunityData)
    }
    return response
  } catch (error) {
    console.warn('[API] createOpportunity failed, falling back to mock adapter:', error.message)
    return await mockAdapter.createOpportunity(opportunityData)
  }
}

export const updateOpportunity = async (id, opportunityData) => {
  try {
    const response = await apiClient.put(`/opportunities/${id}`, opportunityData)
    if (isStubResponse(response)) {
      console.warn('[API] PUT /opportunities/:id is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateOpportunity(id, opportunityData)
    }
    return response
  } catch (error) {
    console.warn('[API] updateOpportunity failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateOpportunity(id, opportunityData)
  }
}

export const deleteOpportunity = async (id) => {
  try {
    const response = await apiClient.delete(`/opportunities/${id}`)
    if (isStubResponse(response)) {
      console.warn('[API] DELETE /opportunities/:id is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.deleteOpportunity(id)
    }
    return response
  } catch (error) {
    console.warn('[API] deleteOpportunity failed, falling back to mock adapter:', error.message)
    return await mockAdapter.deleteOpportunity(id)
  }
}

export const updateApplicationStatus = async (id, status, employerNotes) => {
  try {
    const response = await apiClient.patch(`/applications/${id}/status`, { status, employerNotes })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /applications/:id/status is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateApplicationStatus(id, status, employerNotes)
    }
    return response
  } catch (error) {
    console.warn('[API] updateApplicationStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateApplicationStatus(id, status, employerNotes)
  }
}

export const updateCollegeApprovalStatus = async (id, approvalStatus) => {
  try {
    const response = await apiClient.patch(`/colleges/${id}/approval`, { approvalStatus })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /colleges/:id/approval is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateCollegeApprovalStatus(id, approvalStatus)
    }
    return response
  } catch (error) {
    console.warn('[API] updateCollegeApprovalStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateCollegeApprovalStatus(id, approvalStatus)
  }
}

export const updateOpportunityApprovalStatus = async (id, approvalStatus) => {
  try {
    const response = await apiClient.patch(`/opportunities/${id}/approval`, { approvalStatus })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /opportunities/:id/approval is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateOpportunityApprovalStatus(id, approvalStatus)
    }
    return response
  } catch (error) {
    console.warn('[API] updateOpportunityApprovalStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateOpportunityApprovalStatus(id, approvalStatus)
  }
}

export const updateOnlineClassApprovalStatus = async (id, approvalStatus) => {
  try {
    const response = await apiClient.patch(`/online-classes/${id}/approval`, { approvalStatus })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /online-classes/:id/approval is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateOnlineClassApprovalStatus(id, approvalStatus)
    }
    return response
  } catch (error) {
    console.warn('[API] updateOnlineClassApprovalStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateOnlineClassApprovalStatus(id, approvalStatus)
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/role`, { role })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /users/:id/role is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateUserRole(userId, role)
    }
    return response
  } catch (error) {
    console.warn('[API] updateUserRole failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateUserRole(userId, role)
  }
}

export const updateUserStatus = async (userId, accountStatus) => {
  try {
    const response = await apiClient.patch(`/users/${userId}/status`, { accountStatus })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /users/:id/status is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateUserStatus(userId, accountStatus)
    }
    return response
  } catch (error) {
    console.warn('[API] updateUserStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateUserStatus(userId, accountStatus)
  }
}

export const updateInquiryStatus = async (inquiryId, status) => {
  try {
    const response = await apiClient.patch(`/inquiries/${inquiryId}/status`, { status })
    if (isStubResponse(response)) {
      console.warn('[API] PATCH /inquiries/:id/status is a stub, using mock adapter. TODO: implement backend endpoint')
      return await mockAdapter.updateInquiryStatus(inquiryId, status)
    }
  } catch (error) {
    console.warn('[API] updateInquiryStatus failed, falling back to mock adapter:', error.message)
    return await mockAdapter.updateInquiryStatus(inquiryId, status)
  }
}

export const resetMockData = async () => {
  return await mockAdapter.resetMockData()
}

export default {
  getAuth,
  getMe,
  updateProfile,
  listColleges,
  createCollege,
  updateCollegeApprovalStatus,
  listClasses,
  updateOnlineClassApprovalStatus,
  listOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityApprovalStatus,
  getRecommendations,
  login,
  register,
  logout,
  getApplications,
  createApplication,
  withdrawApplication,
  updateApplicationStatus,
  getInquiries,
  createInquiry,
  updateInquiryStatus,
  getCv,
  saveCv,
  getUsers,
  updateUserRole,
  updateUserStatus,
  resetMockData,
}
