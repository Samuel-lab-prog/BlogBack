import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}
