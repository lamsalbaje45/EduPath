/**
 * Unified Mock Adapter - Single Shared Database Store
 * Reads & writes all resources (colleges, opportunities, onlineClasses, applications, inquiries, users, saved items, CV)
 * from a single localStorage object key: 'edupath_mock_data'.
 */

const MOCK_STORAGE_KEY = 'edupath_mock_data'

export const defaultMockData = {
  user: {
    id: 'user_mock_1',
    _id: 'user_mock_1',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    accountType: 'student',
    accountStatus: 'active',
    studentProfile: {
      bio: 'Aspiring software engineer focused on web development',
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js'],
      interests: ['Web Development', 'Cloud Computing', 'AI'],
      educationLevel: 'Bachelor',
      currentCourse: 'B.Sc. CSIT',
    },
  },

  users: [
    {
      _id: 'usr_1',
      id: 'usr_1',
      firstName: 'Aarav',
      lastName: 'Sharma',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      role: 'student',
      accountType: 'student',
      accountStatus: 'active',
      createdAt: '2026-01-15T09:00:00.000Z',
      studentProfile: {
        educationLevel: 'Bachelor',
        currentCourse: 'B.Sc. CSIT',
        skills: ['React', 'JavaScript', 'Node.js', 'Python'],
        bio: 'Enthusiastic computer science student passionate about full-stack development.',
        careerInterests: ['Software Engineer', 'Frontend Developer'],
      },
    },
    {
      _id: 'usr_2',
      id: 'usr_2',
      firstName: 'Priya',
      lastName: 'Adhikari',
      fullName: 'Priya Adhikari',
      email: 'priya.employer@techcorp.np',
      role: 'employer',
      accountType: 'employer',
      accountStatus: 'active',
      companyName: 'TechCorp Nepal',
      createdAt: '2026-02-10T11:30:00.000Z',
    },
    {
      _id: 'usr_3',
      id: 'usr_3',
      firstName: 'Rajesh',
      lastName: 'Karki',
      fullName: 'Rajesh Karki',
      email: 'admin@kathmandutech.edu.np',
      role: 'college_admin',
      accountType: 'college_admin',
      accountStatus: 'active',
      collegeName: 'Kathmandu Tech College',
      createdAt: '2026-02-20T14:15:00.000Z',
    },
    {
      _id: 'usr_4',
      id: 'usr_4',
      firstName: 'Sita',
      lastName: 'Thapa',
      fullName: 'Sita Thapa',
      email: 'sita.instructor@edupath.np',
      role: 'instructor',
      accountType: 'instructor',
      accountStatus: 'pending',
      createdAt: '2026-03-01T16:00:00.000Z',
    },
    {
      _id: 'usr_5',
      id: 'usr_5',
      firstName: 'System',
      lastName: 'Admin',
      fullName: 'System Admin',
      email: 'admin@edupath.np',
      role: 'admin',
      accountType: 'admin',
      accountStatus: 'active',
      createdAt: '2025-12-01T08:00:00.000Z',
    },
  ],

  colleges: [
    {
      _id: 'col_1',
      collegeName: 'Kathmandu Tech College',
      city: 'Kathmandu',
      address: 'Maitighar, Kathmandu',
      affiliation: 'Tribhuvan University',
      courses: ['B.Sc. CSIT', 'BCA', 'BIT'],
      feeRange: 'NPR 4,00,000 - 6,00,000',
      facilities: ['Library', 'Computer Labs', 'Sports Ground', 'Cafeteria', 'Wi-Fi'],
      description: 'Premier institution for computer science and information technology education in Kathmandu.',
      contactEmail: 'info@kathmandutech.edu.np',
      contactPhone: '+977 01-4221100',
      website: 'https://kathmandutech.edu.np',
      rating: 4.6,
      admissionStatus: 'open',
      approvalStatus: 'approved',
      images: ['https://images.unsplash.com/photo-1562774053-701939374585?w=800'],
      createdAt: '2026-01-10T08:00:00.000Z',
    },
    {
      _id: 'col_2',
      collegeName: 'Pokhara Engineering College',
      city: 'Pokhara',
      address: 'Phulbari, Pokhara',
      affiliation: 'Pokhara University',
      courses: ['Civil Engineering', 'Computer Engineering', 'BBA'],
      feeRange: 'NPR 5,00,000 - 7,50,000',
      facilities: ['Hostel', 'Labs', 'Transportation', 'Library'],
      description: 'Leading engineering college located in the scenic valley of Pokhara.',
      contactEmail: 'admissions@pec.edu.np',
      contactPhone: '+977 061-520123',
      website: 'https://pec.edu.np',
      rating: 4.4,
      admissionStatus: 'open',
      approvalStatus: 'approved',
      images: ['https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800'],
      createdAt: '2026-01-20T10:00:00.000Z',
    },
  ],

  opportunities: [
    {
      _id: 'opp_1',
      title: 'Frontend React Developer Intern',
      companyName: 'Pi Innovations',
      employer: 'usr_2',
      type: 'internship',
      location: 'Kathmandu',
      workMode: 'hybrid',
      stipendOrSalaryRange: 'NPR 12,00,00 - 18,000 / month',
      requiredSkills: ['React', 'JavaScript', 'CSS/Tailwind'],
      suitableCourses: ['B.Sc. CSIT', 'BCA', 'BIT'],
      applicationDeadline: '2026-10-30',
      description: 'Join our energetic team building modern web applications for international clients.',
      applicationLink: '',
      internalApplication: true,
      status: 'active',
      approvalStatus: 'approved',
      createdAt: '2026-02-01T09:00:00.000Z',
    },
    {
      _id: 'opp_2',
      title: 'Python / Django Developer',
      companyName: 'TechCorp Nepal',
      employer: 'usr_2',
      type: 'job',
      location: 'Lalitpur',
      workMode: 'remote',
      stipendOrSalaryRange: 'NPR 45,000 - 65,000 / month',
      requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
      suitableCourses: ['Computer Engineering', 'B.Sc. CSIT'],
      applicationDeadline: '2026-11-15',
      description: 'Looking for a skilled backend developer to build robust microservices.',
      applicationLink: '',
      internalApplication: true,
      status: 'active',
      approvalStatus: 'approved',
      createdAt: '2026-02-10T14:00:00.000Z',
    },
  ],

  classes: [
    {
      _id: 'cls_1',
      classTitle: 'Full-Stack JavaScript Masterclass',
      instructorOrOrganization: 'EduPath Academy',
      level: 'intermediate',
      mode: 'live',
      duration: '8 weeks',
      price: 0,
      subjects: ['React', 'Node.js', 'Express', 'MongoDB'],
      certificateAvailability: true,
      description: 'Hands-on live boot-camp covering full-stack web development from scratch.',
      startDate: '2026-09-15',
      schedule: 'Mon / Wed / Fri - 6:00 PM to 8:00 PM',
      enrollmentLink: '',
      approvalStatus: 'approved',
      createdAt: '2026-02-15T10:00:00.000Z',
    },
    {
      _id: 'cls_2',
      classTitle: 'Python Data Science Essentials',
      instructorOrOrganization: 'DataLabs Nepal',
      level: 'beginner',
      mode: 'recorded',
      duration: '6 weeks',
      price: 2500,
      subjects: ['Python', 'Pandas', 'NumPy', 'Data Visualization'],
      certificateAvailability: true,
      description: 'Master data analysis and visualization techniques using Python.',
      startDate: '2026-09-20',
      schedule: 'Self-paced video modules',
      enrollmentLink: 'https://datalabs.example.com/python',
      approvalStatus: 'approved',
      createdAt: '2026-02-25T11:00:00.000Z',
    },
  ],

  applications: [
    {
      id: 'app_1',
      _id: 'app_1',
      opportunityId: 'opp_1',
      opportunityTitle: 'Frontend React Developer Intern',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      coverMessage: 'I have extensive experience with React and Tailwind CSS and would love to contribute.',
      status: 'submitted',
      employerNotes: 'Promising portfolio.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  inquiries: [
    {
      id: 'inq_1',
      _id: 'inq_1',
      collegeId: 'col_1',
      collegeName: 'Kathmandu Tech College',
      message: 'What are the scholarship criteria for CSIT students?',
      status: 'pending',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  savedColleges: ['col_1'],
  savedOpportunities: ['opp_1'],
  savedClasses: ['cls_1'],

  cv: {
    id: 'cv_1',
    personalDetails: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+977 9801234567',
      address: 'Kathmandu, Nepal',
      summary: 'Passionate and results-driven software engineering student with expertise in full-stack web development, React, and RESTful APIs.',
    },
    educationEntries: [
      {
        institution: 'Tribhuvan University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2021-09-01',
        endDate: '2025-06-30',
        gradeOrScore: '3.8 GPA',
      },
    ],
    skillList: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    experienceEntries: [
      {
        title: 'Junior Web Developer',
        organization: 'Tech Innovations Nepal',
        startDate: '2023-06-01',
        endDate: '2023-12-31',
        description: 'Developed responsive UI components in React and integrated REST APIs with backend services.',
      },
    ],
    projectEntries: [
      {
        name: 'EduPath Career & Education Portal',
        description: 'Full-stack educational platform helping students explore colleges, jobs, and courses.',
        link: 'https://github.com/lamsalbaje45/EduPath',
      },
    ],
    certifications: [
      {
        name: 'Full Stack Web Development Certification',
        issuer: 'Coursera',
        date: '2023-08-15',
        link: '',
      },
    ],
    languages: ['English', 'Nepali'],
    templatePreference: 'modern',
    publicShareStatus: false,
  },
}

const getStoredMockData = () => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaultMockData))
      return defaultMockData
    }
    const parsed = JSON.parse(raw)
    // Merge defaults for missing top-level keys
    return {
      ...defaultMockData,
      ...parsed,
      colleges: parsed.colleges || defaultMockData.colleges,
      opportunities: parsed.opportunities || defaultMockData.opportunities,
      classes: parsed.classes || defaultMockData.classes,
      users: parsed.users || defaultMockData.users,
      applications: parsed.applications || defaultMockData.applications,
      inquiries: parsed.inquiries || defaultMockData.inquiries,
      savedColleges: parsed.savedColleges || defaultMockData.savedColleges,
      savedOpportunities: parsed.savedOpportunities || defaultMockData.savedOpportunities,
      savedClasses: parsed.savedClasses || defaultMockData.savedClasses,
    }
  } catch {
    return defaultMockData
  }
}

const setStoredMockData = (data) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.warn('Failed to persist mock database to localStorage')
  }
}

export const mockAdapter = {
  // --- STORE RESET DEV TOOL ---
  resetMockData: async () => {
    localStorage.removeItem(MOCK_STORAGE_KEY)
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaultMockData))
    return {
      success: true,
      message: 'Mock database reset to original seed state.',
      data: defaultMockData,
    }
  },

  // --- AUTH ADAPTERS ---
  login: async (email, password) => {
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' }
    }
    
    const mockData = getStoredMockData()
    const foundUser = (mockData.users || defaultMockData.users).find((u) => u.email === email) || mockData.user || defaultMockData.user
    const token = `mock_token_${Date.now()}`
    
    return {
      success: true,
      message: 'User logged in successfully',
      data: { user: foundUser, token },
    }
  },

  register: async (firstName, lastName, email, password, accountType) => {
    if (!firstName || !lastName || !email || !password) {
      throw { status: 400, message: 'All fields are required' }
    }
    
    const newUser = {
      id: `usr_${Date.now()}`,
      _id: `usr_${Date.now()}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      role: accountType || 'student',
      accountType: accountType || 'student',
      accountStatus: 'active',
      studentProfile: accountType === 'student' ? { bio: '', skills: [], interests: [] } : undefined,
      createdAt: new Date().toISOString(),
    }
    
    const token = `mock_token_${Date.now()}`
    const mockData = getStoredMockData()
    mockData.user = newUser
    if (!mockData.users) mockData.users = []
    mockData.users.push(newUser)
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'User registered successfully',
      data: { user: newUser, token },
    }
  },

  logout: async () => {
    return {
      success: true,
      message: 'User logged out successfully',
    }
  },

  getCurrentUser: async () => {
    const mockData = getStoredMockData()
    return {
      success: true,
      message: 'Current user retrieved',
      data: mockData.user || defaultMockData.user,
      user: mockData.user || defaultMockData.user,
    }
  },

  updateProfile: async (userId, profileData) => {
    const mockData = getStoredMockData()
    const user = mockData.user || defaultMockData.user
    const updatedUser = {
      ...user,
      ...profileData,
      studentProfile: {
        ...(user.studentProfile || {}),
        ...(profileData.studentProfile || {}),
      },
    }
    mockData.user = updatedUser
    setStoredMockData(mockData)
    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    }
  },

  // --- COLLEGES LIST & APPROVALS ---
  listColleges: async (params = {}) => {
    const mockData = getStoredMockData()
    const colleges = mockData.colleges || defaultMockData.colleges
    
    return {
      success: true,
      message: 'Colleges retrieved successfully',
      data: colleges,
      meta: {
        total: colleges.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },

  createCollege: async (collegeData) => {
    const mockData = getStoredMockData()
    if (!mockData.colleges) mockData.colleges = []

    const newCollege = {
      _id: `col_${Date.now()}`,
      ...collegeData,
      rating: collegeData.rating || 0,
      admissionStatus: collegeData.admissionStatus || 'open',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    }

    mockData.colleges.push(newCollege)
    setStoredMockData(mockData)

    return {
      success: true,
      message: 'College submitted for review, pending approval',
      data: newCollege,
    }
  },

  updateCollegeApprovalStatus: async (id, approvalStatus) => {
    const mockData = getStoredMockData()
    const colleges = mockData.colleges || []
    const idx = colleges.findIndex((c) => (c._id || c.id) === id)
    if (idx !== -1) {
      colleges[idx].approvalStatus = approvalStatus
      mockData.colleges = colleges
      setStoredMockData(mockData)
      return { success: true, message: `College approval status updated to ${approvalStatus}`, data: colleges[idx] }
    }
    return { success: false, message: 'College not found' }
  },

  // --- OPPORTUNITIES / JOBS LIST & APPROVALS ---
  listOpportunities: async (params = {}) => {
    const mockData = getStoredMockData()
    const opportunities = mockData.opportunities || defaultMockData.opportunities

    return {
      success: true,
      message: 'Opportunities retrieved successfully',
      data: opportunities,
      meta: {
        total: opportunities.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },

  createOpportunity: async (opportunityData) => {
    const mockData = getStoredMockData()
    if (!mockData.opportunities) mockData.opportunities = []

    const newOpp = {
      _id: `opp_${Date.now()}`,
      ...opportunityData,
      status: opportunityData.status || 'active',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    }

    mockData.opportunities.push(newOpp)
    setStoredMockData(mockData)

    return {
      success: true,
      message: 'Opportunity submitted for review, pending approval',
      data: newOpp,
    }
  },

  updateOpportunity: async (id, opportunityData) => {
    const mockData = getStoredMockData()
    const opps = mockData.opportunities || defaultMockData.opportunities
    const index = opps.findIndex((o) => (o._id || o.id) === id)
    if (index !== -1) {
      opps[index] = { ...opps[index], ...opportunityData }
      mockData.opportunities = opps
      setStoredMockData(mockData)
      return {
        success: true,
        message: 'Opportunity updated successfully',
        data: opps[index],
      }
    }
    return { success: false, message: 'Opportunity not found' }
  },

  deleteOpportunity: async (id) => {
    const mockData = getStoredMockData()
    const opps = mockData.opportunities || defaultMockData.opportunities
    mockData.opportunities = opps.filter((o) => (o._id || o.id) !== id)
    setStoredMockData(mockData)
    return {
      success: true,
      message: 'Opportunity deleted successfully',
    }
  },

  updateOpportunityApprovalStatus: async (id, approvalStatus) => {
    const mockData = getStoredMockData()
    const opps = mockData.opportunities || []
    const idx = opps.findIndex((o) => (o._id || o.id) === id)
    if (idx !== -1) {
      opps[idx].approvalStatus = approvalStatus
      mockData.opportunities = opps
      setStoredMockData(mockData)
      return { success: true, message: `Opportunity approval status updated to ${approvalStatus}`, data: opps[idx] }
    }
    return { success: false, message: 'Opportunity not found' }
  },

  // --- ONLINE CLASSES ---
  listClasses: async (params = {}) => {
    const mockData = getStoredMockData()
    const classes = mockData.classes || defaultMockData.classes

    return {
      success: true,
      message: 'Online classes retrieved successfully',
      data: classes,
      meta: {
        total: classes.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    }
  },

  updateOnlineClassApprovalStatus: async (id, approvalStatus) => {
    const mockData = getStoredMockData()
    const classes = mockData.classes || []
    const idx = classes.findIndex((cls) => (cls._id || cls.id) === id)
    if (idx !== -1) {
      classes[idx].approvalStatus = approvalStatus
      mockData.classes = classes
      setStoredMockData(mockData)
      return { success: true, message: `Class approval status updated to ${approvalStatus}`, data: classes[idx] }
    }
    return { success: false, message: 'Class not found' }
  },

  // --- APPLICATIONS ---
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

  createApplication: async (application) => {
    const mockData = getStoredMockData()
    if (!mockData.applications) mockData.applications = []

    const applicationData = typeof application === 'string'
      ? { opportunityId: application }
      : application
    
    const newApp = {
      id: `app_${Date.now()}`,
      _id: `app_${Date.now()}`,
      opportunityId: applicationData.opportunityId,
      coverMessage: applicationData.coverMessage || '',
      cvReference: applicationData.cvReference,
      cvSnapshot: applicationData.cvSnapshot,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
    }
    
    mockData.applications.push(newApp)
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'Application submitted successfully',
      data: newApp,
    }
  },

  withdrawApplication: async (id) => {
    const mockData = getStoredMockData()
    const apps = mockData.applications || defaultMockData.applications
    const updatedApps = apps.filter((a) => (a.id || a._id) !== id)
    mockData.applications = updatedApps
    setStoredMockData(mockData)
    
    return {
      success: true,
      message: 'Application withdrawn successfully',
    }
  },

  updateApplicationStatus: async (id, status, employerNotes = '') => {
    const mockData = getStoredMockData()
    const apps = mockData.applications || defaultMockData.applications
    const index = apps.findIndex((a) => (a.id || a._id) === id)
    if (index !== -1) {
      apps[index] = {
        ...apps[index],
        status: status || apps[index].status,
        employerNotes: employerNotes !== undefined ? employerNotes : (apps[index].employerNotes || ''),
      }
      mockData.applications = apps
      setStoredMockData(mockData)
      return {
        success: true,
        message: `Application status updated to ${status}`,
        data: apps[index],
      }
    }
    return { success: false, message: 'Application not found' }
  },

  // --- INQUIRIES ---
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

  createInquiry: async (collegeIdOrPayload, message) => {
    const mockData = getStoredMockData()
    if (!mockData.inquiries) mockData.inquiries = []

    const inquiryPayload = typeof collegeIdOrPayload === 'object' && collegeIdOrPayload !== null
      ? collegeIdOrPayload
      : { collegeId: collegeIdOrPayload, message }
    
    const newInquiry = {
      id: `inq_${Date.now()}`,
      _id: `inq_${Date.now()}`,
      ...inquiryPayload,
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

  updateInquiryStatus: async (inquiryId, status) => {
    const mockData = getStoredMockData()
    const inqs = mockData.inquiries || []
    const idx = inqs.findIndex((i) => (i._id || i.id) === inquiryId)
    if (idx !== -1) {
      inqs[idx].status = status
      mockData.inquiries = inqs
      setStoredMockData(mockData)
      return { success: true, message: `Inquiry status updated to ${status}`, data: inqs[idx] }
    }
    return { success: false, message: 'Inquiry not found' }
  },

  // --- USERS MANAGEMENT ---
  getUsers: async (params = {}) => {
    const mockData = getStoredMockData()
    const users = mockData.users || defaultMockData.users

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

  updateUserRole: async (userId, role) => {
    const mockData = getStoredMockData()
    const users = mockData.users || []
    const idx = users.findIndex((u) => (u._id || u.id) === userId)
    if (idx !== -1) {
      users[idx].role = role
      users[idx].accountType = role
      mockData.users = users
      setStoredMockData(mockData)
      return { success: true, message: `User role updated to ${role}`, data: users[idx] }
    }
    return { success: false, message: 'User not found' }
  },

  updateUserStatus: async (userId, accountStatus) => {
    const mockData = getStoredMockData()
    const users = mockData.users || []
    const idx = users.findIndex((u) => (u._id || u.id) === userId)
    if (idx !== -1) {
      users[idx].accountStatus = accountStatus
      mockData.users = users
      setStoredMockData(mockData)
      return { success: true, message: `User account status updated to ${accountStatus}`, data: users[idx] }
    }
    return { success: false, message: 'User not found' }
  },

  // --- CV MAKER ---
  getCv: async () => {
    const mockData = getStoredMockData()
    const cv = mockData.cv || defaultMockData.cv
    
    return {
      success: true,
      message: 'CV retrieved successfully',
      data: cv,
    }
  },

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

  // --- RECOMMENDATIONS ---
  getRecommendations: async () => {
    const mockData = getStoredMockData()
    const colleges = mockData.colleges || defaultMockData.colleges
    const opportunities = mockData.opportunities || defaultMockData.opportunities
    const classes = mockData.classes || defaultMockData.classes

    const mappedColleges = colleges.filter(c => c.approvalStatus === 'approved').slice(0, 2).map((c) => ({
      id: c._id || c.id,
      label: 'College Match',
      title: c.collegeName,
      meta: `${c.courses?.[0] || 'Degree'} - ${c.city} - Scholarship available`,
      type: 'college',
    }))

    const mappedOpps = opportunities.filter(o => o.approvalStatus === 'approved' && o.status !== 'closed').slice(0, 2).map((o) => ({
      id: o._id || o.id,
      label: o.type === 'internship' ? 'Internship Match' : 'Job Match',
      title: o.title,
      meta: `${o.companyName} - ${o.workMode || o.location || 'Onsite'} - ${o.stipendOrSalaryRange || 'Competitive'}`,
      type: 'opportunity',
    }))

    const mappedClasses = classes.filter(cl => cl.approvalStatus === 'approved').slice(0, 1).map((cl) => ({
      id: cl._id || cl.id,
      label: 'Online Class',
      title: cl.classTitle,
      meta: `${cl.mode || 'Live class'} - ${cl.duration || 'Flexible'} - ${cl.certificateAvailability ? 'Certificate' : 'Course'}`,
      type: 'class',
    }))

    const items = [...mappedColleges, ...mappedOpps, ...mappedClasses]

    return {
      success: true,
      message: 'Recommendations retrieved successfully',
      data: items,
    }
  },
}

export default mockAdapter
