import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Not authorized.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'belimaa-secret', {
      issuer: process.env.JWT_ISSUER || 'belimaa-api',
      audience: process.env.JWT_AUDIENCE || 'belimaa-admin'
    });

    const user = await User.findById(decoded.id).select('_id name email role tokenVersion');
    if (!user || user.tokenVersion !== Number(decoded.tokenVersion || 0)) {
      return res.status(401).json({ message: 'Session is no longer valid.' });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}
