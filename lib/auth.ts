import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: 'reader' | 'writer' | 'admin';
  plan: 'free' | 'reader' | 'writer';
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function signEmailToken(payload: { userId: string; type: 'activate' | 'reset' }): string {
  const options: SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyEmailToken(token: string): { userId: string; type: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
  } catch {
    return null;
  }
}

export async function getServerUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
