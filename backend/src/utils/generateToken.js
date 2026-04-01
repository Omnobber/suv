import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET || 'belimaa-secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
      issuer: process.env.JWT_ISSUER || 'belimaa-api',
      audience: process.env.JWT_AUDIENCE || 'belimaa-admin'
    }
  );
}
