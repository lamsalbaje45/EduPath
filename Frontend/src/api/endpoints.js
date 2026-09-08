/**
 * API Endpoints - High-level resource functions mapped 1:1 to Backend/routes/*.js
 */

import apiClient from './client'

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, value)
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

/**
 * AUTH
 */

export const register = (fullName, email, password, role = 'student', phoneNumber) =>
  apiClient.post('/auth/register', { fullName, email, password, role, phoneNumber })

export const login = (email, password) => apiClient.post('/auth/login', { email, password })

export const logout = () => apiClient.post('/auth/logout', {})

export const getMe = () => apiClient.get('/auth/me')

export const changePassword = (currentPassword, newPassword) =>
  apiClient.patch('/auth/change-password', { currentPassword, newPassword })

/**
 * USERS (account-level self/admin management)
 */

export const updateMyAccount = (payload) => apiClient.patch('/users/me', payload)

export const uploadProfileImage = (file) => {
  const formData = new FormData()
  formData.append('profileImage', file)
  return apiClient.post('/users/me/profile-image', formData)
}

export const getUsers = (params = {}) => apiClient.get(`/users${toQueryString(params)}`)

export const updateUserRole = (userId, role) => apiClient.patch(`/users/${userId}/role`, { role })

export const updateUserStatus = (userId, accountStatus) =>
  apiClient.patch(`/users/${userId}/status`, { accountStatus })

/**
 * STUDENTS (studentProfile fields + saved items)
 */

export const getMyStudentProfile = () => apiClient.get('/students/me')

export const updateMyStudentProfile = (payload) => apiClient.patch('/students/me', payload)

export const getMySavedItems = () => apiClient.get('/students/me/saved')

export const saveItem = (type, itemId) => apiClient.post(`/students/me/saved/${type}/${itemId}`)

export const removeSavedItem = (type, itemId) => apiClient.del(`/students/me/saved/${type}/${itemId}`)

/**
 * Combined profile update used by the Profile page: splits basic account
 * fields (PATCH /users/me) from studentProfile fields (PATCH /students/me).
 */
export const updateProfile = async ({ fullName, phoneNumber, profileImage, studentProfile } = {}) => {
  let result
  if (fullName !== undefined || phoneNumber !== undefined || profileImage !== undefined) {
    result = await updateMyAccount({ fullName, phoneNumber, profileImage })
  }
  if (studentProfile) {
    result = await updateMyStudentProfile(studentProfile)
  }
  return result
}

/**
 * COLLEGES
 */

export const listColleges = (params = {}) => apiClient.get(`/colleges${toQueryString(params)}`)

export const getCollegeById = (id) => apiClient.get(`/colleges/${id}`)

export const createCollege = (data) => apiClient.post('/colleges', data)

export const updateCollege = (id, data) => apiClient.patch(`/colleges/${id}`, data)

export const deleteCollege = (id) => apiClient.del(`/colleges/${id}`)

export const updateCollegeApprovalStatus = (id, approvalStatus) =>
  apiClient.patch(`/colleges/${id}/approval`, { approvalStatus })

/**
 * OPPORTUNITIES (jobs & internships)
 */

export const listOpportunities = (params = {}) => apiClient.get(`/opportunities${toQueryString(params)}`)

export const getOpportunityById = (id) => apiClient.get(`/opportunities/${id}`)

export const createOpportunity = (data) => apiClient.post('/opportunities', data)

export const updateOpportunity = (id, data) => apiClient.patch(`/opportunities/${id}`, data)

export const deleteOpportunity = (id) => apiClient.del(`/opportunities/${id}`)

export const updateOpportunityApprovalStatus = (id, approvalStatus) =>
  apiClient.patch(`/opportunities/${id}/approval`, { approvalStatus })

/**
 * CLASSES (online classes)
 */

export const listClasses = (params = {}) => apiClient.get(`/classes${toQueryString(params)}`)

export const getClassById = (id) => apiClient.get(`/classes/${id}`)

export const createClass = (data) => apiClient.post('/classes', data)

export const updateClass = (id, data) => apiClient.patch(`/classes/${id}`, data)

export const deleteClass = (id) => apiClient.del(`/classes/${id}`)

export const updateOnlineClassApprovalStatus = (id, approvalStatus) =>
  apiClient.patch(`/classes/${id}/approval`, { approvalStatus })

/**
 * APPLICATIONS
 */

export const getMyApplications = (params = {}) => apiClient.get(`/applications/me${toQueryString(params)}`)

export const getReceivedApplications = (params = {}) =>
  apiClient.get(`/applications/received${toQueryString(params)}`)

export const createApplication = (opportunityOrPayload, legacyCoverMessage) => {
  if (typeof opportunityOrPayload === 'string') {
    return apiClient.post('/applications', { opportunity: opportunityOrPayload, coverMessage: legacyCoverMessage })
  }

  const { opportunity, opportunityId, coverMessage, cvFile } = opportunityOrPayload

  if (cvFile) {
    const formData = new FormData()
    formData.append('opportunity', opportunity || opportunityId)
    if (coverMessage) formData.append('coverMessage', coverMessage)
    formData.append('cvFile', cvFile)
    return apiClient.post('/applications', formData)
  }

  return apiClient.post('/applications', { opportunity: opportunity || opportunityId, coverMessage })
}

export const updateApplicationStatus = (id, status, employerNotes) =>
  apiClient.patch(`/applications/${id}/status`, { status, employerNotes })

export const withdrawApplication = (id) => apiClient.del(`/applications/${id}`)

/**
 * INQUIRIES
 */

export const getMyInquiries = (params = {}) => apiClient.get(`/inquiries/me${toQueryString(params)}`)

export const getReceivedInquiries = (params = {}) => apiClient.get(`/inquiries/received${toQueryString(params)}`)

export const createInquiry = ({ targetType, targetRecord, message, phone }) =>
  apiClient.post('/inquiries', { targetType, targetRecord, message, phone })

export const updateInquiryStatus = (id, status) => apiClient.patch(`/inquiries/${id}/status`, { status })

/**
 * CV
 */

export const getCv = () => apiClient.get('/cv/me')

export const saveCv = (cvData) => apiClient.patch('/cv/me', cvData)

/**
 * RECOMMENDATIONS
 */

export const getRecommendations = (type, params = {}) => {
  let endpoint = '/recommendations'
  if (type === 'opportunities') endpoint += '/opportunities'
  else if (type === 'colleges') endpoint += '/colleges'
  else if (type === 'classes') endpoint += '/classes'
  else if (type === 'all') endpoint += '/all'

  return apiClient.get(`${endpoint}${toQueryString(params)}`)
}

export default {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateMyAccount,
  uploadProfileImage,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getMyStudentProfile,
  updateMyStudentProfile,
  getMySavedItems,
  saveItem,
  removeSavedItem,
  updateProfile,
  listColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  updateCollegeApprovalStatus,
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityApprovalStatus,
  listClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  updateOnlineClassApprovalStatus,
  getMyApplications,
  getReceivedApplications,
  createApplication,
  updateApplicationStatus,
  withdrawApplication,
  getMyInquiries,
  getReceivedInquiries,
  createInquiry,
  updateInquiryStatus,
  getCv,
  saveCv,
  getRecommendations,
}
