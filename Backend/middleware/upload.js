import multer from 'multer';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function imageFileFilter(req, file, cb) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
        const error = new Error('Only JPEG, PNG, GIF, and WebP images are allowed.');
        error.status = 400;
        return cb(error);
    }

    return cb(null, true);
}

const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PROFILE_IMAGE_SIZE },
    fileFilter: imageFileFilter,
}).single('profileImage');

const ALLOWED_CV_MIME_TYPES = ['application/pdf'];
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function cvFileFilter(req, file, cb) {
    if (!ALLOWED_CV_MIME_TYPES.includes(file.mimetype)) {
        const error = new Error('Only PDF files are allowed for CV uploads.');
        error.status = 400;
        return cb(error);
    }

    return cb(null, true);
}

const cvFileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_CV_FILE_SIZE },
    fileFilter: cvFileFilter,
}).single('cvFile');

export { profileImageUpload, cvFileUpload };
