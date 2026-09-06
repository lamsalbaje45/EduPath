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

export { profileImageUpload };
