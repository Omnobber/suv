import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Not authorized.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'belimaa-secret');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}
