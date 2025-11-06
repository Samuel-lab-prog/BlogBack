import jwt from 'jsonwebtoken';
export interface Payload {
  id: number;
  email: string;
}
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(payload: Payload): string {
  const token = jwt.sign(payload, JWT_SECRET);
  return token;
}

export function verifyToken(token: string): Payload | null {
  try {
    const user = jwt.verify(token, JWT_SECRET) as Payload;
    return user;
  } catch {
    return null;
  }
}
