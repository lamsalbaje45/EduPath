import jwt from 'jsonwebtoken';

function getJwtSecret() {
    return process.env.JWT_SECRET || 'development-secret';
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication token is required.',
        });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());

        req.user = {
            id: decoded.id || decoded._id,
            role: decoded.role,
            email: decoded.email,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token.',
            error: error.message,
        });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = {
            id: decoded.id || decoded._id,
            role: decoded.role,
            email: decoded.email,
        };
    } catch (error) {
        req.user = null;
    }

    return next();
}

export { authenticateToken, optionalAuth };
