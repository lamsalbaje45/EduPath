const ROLES = Object.freeze({
    STUDENT: 'student',
    COLLEGE_ADMIN: 'college_admin',
    EMPLOYER: 'employer',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
});

const ROLE_LABELS = Object.freeze({
    [ROLES.STUDENT]: 'Student',
    [ROLES.COLLEGE_ADMIN]: 'College Admin',
    [ROLES.EMPLOYER]: 'Employer',
    [ROLES.INSTRUCTOR]: 'Instructor',
    [ROLES.ADMIN]: 'Admin',
});

const ROLE_ACCESS_RULES = Object.freeze({
    [ROLES.STUDENT]: [
        'create and update profile data',
        'save colleges, jobs, and classes',
        'apply to opportunities',
        'send inquiries',
        'manage CV data',
    ],
    [ROLES.COLLEGE_ADMIN]: [
        'create and update college listings',
        'view inquiries for owned colleges',
    ],
    [ROLES.EMPLOYER]: [
        'create and update job and internship listings',
        'view applications for owned opportunities',
    ],
    [ROLES.INSTRUCTOR]: [
        'create and update online class listings',
        'view inquiries for owned classes',
    ],
    [ROLES.ADMIN]: [
        'manage all records',
        'approve listings',
        'moderate content',
    ],
});

const ROLE_PRIORITY = Object.freeze([
    ROLES.STUDENT,
    ROLES.COLLEGE_ADMIN,
    ROLES.EMPLOYER,
    ROLES.INSTRUCTOR,
    ROLES.ADMIN,
]);

export { ROLE_ACCESS_RULES, ROLE_LABELS, ROLE_PRIORITY, ROLES };