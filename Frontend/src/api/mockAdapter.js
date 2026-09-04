/**
 * Mock Adapter - localStorage-backed fallback for stub endpoints
 * Used when backend returns "route group" placeholder instead of real data
 * Provides temporary data so UI is fully functional while backend team implements endpoints
 */

const MOCK_STORAGE_KEY = 'edupath_mock_data'

const getStoredMockData = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const setStoredMockData = (data) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.warn('Failed to persist mock data to localStorage')
  }
}

const defaultMockData = {
  user: {
    id: 'user_mock_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    accountType: 'student',
    studentProfile: {
      bio: 'Aspiring software engineer focused on web development',
      skills: ['React', 'JavaScript', 'Tailwind CSS'],
      interests: ['Web Development', 'Cloud Computing'],
    },
  },
  applications: [
    {
      id: 'app_1',
      opportunityId: 'opp_1',
      opportunityTitle: 'Frontend Intern - Pi Innovations',
      status: 'applied',
      appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'app_2',
      opportunityId: 'opp_2',
      opportunityTitle: 'Python Developer - TechCorp',
      status: 'accepted',
      appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  inquiries: [
    {
      id: 'inq_1',
      collegeId: 'col_1',
      collegeName: 'Kathmandu Tech College',
      message: 'What are the scholarship opportunities?',
      status: 'pending',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  cv: {
    id: 'cv_1',
    title: 'Software Engineering CV',
    sections: {
      summary: 'Aspiring full-stack developer with passion for building scalable applications',
      education: [
        {
          school: 'Tribhuvan University',
          degree: 'Bachelor of Science in Computer Science',
          year: 2024,
        },
      ],
      experience: [
        {
          company: 'Local Tech Startup',
          position: 'Junior Developer',
          duration: '6 months',
          description: 'Developed React components and fixed bugs',
        },
      ],
      skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    },
  },
}

export const mockAdapter = {
  /**
   * Login - returns user + token
   * TODO: replace with real API once backend implements /auth/login
   */
  login: async (email, password) => {
    // Validate email/password locally
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' }
    }
    
    const mockData = getStoredMockData()
    const user = mockData.user || defaultMockData.user
    const token = `mock_token_${Date.now()}`
    
    return {
      success: true,
      message: 'User logged in successfully',
      data: { user, token },
    }
  },

  /**
   * Register - creates user + token
   * TODO: replace with real API once backend implements /auth/register
   */
  register: async (firstName, lastName, email, password, accountType) => {
    if (!firstName || !lastName || !email || !password) {
      throw { status: 400, message: 'All fields are required' }
    }
    
    const newUser = {
      id: `user_mock_${Date.now()}`,
      firstName,
      lastName,
      email,
      accountType: accountType || 'student',
      studentProfile: accountType === 'student' ? { bio: '', skills: [], interests: [] } : undefined,
    }
    
    const token = `mock_token_${Date.now()}`
    const mockData = getStoredMockData()
    mockData.user = newUser
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'User registered successfully',
      data: { user: newUser, token },
    }
  },

  /**
   * Logout - clears token
   * TODO: replace with real API once backend implements /auth/logout
   */
  logout: async () => {
    return {
      success: true,
      message: 'User logged out successfully',
    }
  },

  /**
   * Get current user
   * TODO: remove when backend properly implements /auth/me
   */
  getCurrentUser: async () => {
    const mockData = getStoredMockData()
    return {
      success: true,
      message: 'Current user retrieved',
      data: mockData.user || defaultMockData.user,
      user: mockData.user || defaultMockData.user,
    }
  },

  /**
   * List applications
   * TODO: replace with real API once backend implements /applications
   */
  getApplications: async (params = {}) => {
    const mockData = getStoredMockData()
    const applications = mockData.applications || defaultMockData.applications
    
    return {
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
      meta: {
        total: applications.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },

  /**
   * Create application
   * TODO: replace with real API once backend implements POST /applications
   */
  createApplication: async (opportunityId, message) => {
    const mockData = getStoredMockData()
    if (!mockData.applications) mockData.applications = []
    
    const newApp = {
      id: `app_${Date.now()}`,
      opportunityId,
      status: 'applied',
      message,
      appliedDate: new Date().toISOString(),
    }
    
    mockData.applications.push(newApp)
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'Application submitted successfully',
      data: newApp,
    }
  },

  /**
   * Get inquiries
   * TODO: replace with real API once backend implements /inquiries
   */
  getInquiries: async (params = {}) => {
    const mockData = getStoredMockData()
    const inquiries = mockData.inquiries || defaultMockData.inquiries
    
    return {
      success: true,
      message: 'Inquiries retrieved successfully',
      data: inquiries,
      meta: {
        total: inquiries.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },

  /**
   * Create inquiry
   * TODO: replace with real API once backend implements POST /inquiries
   */
  createInquiry: async (collegeId, message) => {
    const mockData = getStoredMockData()
    if (!mockData.inquiries) mockData.inquiries = []
    
    const newInquiry = {
      id: `inq_${Date.now()}`,
      collegeId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    mockData.inquiries.push(newInquiry)
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'Inquiry submitted successfully',
      data: newInquiry,
    }
  },

  /**
   * Get CV
   * TODO: replace with real API once backend implements GET /cv
   */
  getCv: async () => {
    const mockData = getStoredMockData()
    const cv = mockData.cv || defaultMockData.cv
    
    return {
      success: true,
      message: 'CV retrieved successfully',
      data: cv,
    }
  },

  /**
   * Save CV
   * TODO: replace with real API once backend implements PUT /cv
   */
  saveCv: async (cvData) => {
    const mockData = getStoredMockData()
    const cv = {
      id: `cv_${Date.now()}`,
      ...cvData,
      updatedAt: new Date().toISOString(),
    }
    
    mockData.cv = cv
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'CV saved successfully',
      data: cv,
    }
  },

  /**
   * Get users (admin/general list)
   * TODO: replace with real API once backend implements /users
   */
  getUsers: async (params = {}) => {
    const mockData = getStoredMockData()
    const users = [mockData.user || defaultMockData.user]
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        total: users.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },
}

export default mockAdapter
