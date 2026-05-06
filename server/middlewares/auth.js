import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token' } });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (_e) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
}