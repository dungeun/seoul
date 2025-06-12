import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface AuthResult {
  isAuthenticated: boolean;
  userId?: number;
  username?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      isAuthenticated: true,
      userId: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export function createToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}