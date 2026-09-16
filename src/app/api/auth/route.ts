import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = dbService.getUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Return a simulated user session
      const { passwordHash: _, ...userSession } = user;
      return NextResponse.json({
        user: userSession,
        token: `mock-jwt-token-for-${user.id}`
      });
    }

    if (action === 'signup') {
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      const existing = dbService.getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const newUser = dbService.createUser({
        name,
        email,
        passwordHash: password,
        role: 'customer' // Defaults to customer
      });

      const { passwordHash: _, ...userSession } = newUser;
      return NextResponse.json({
        user: userSession,
        token: `mock-jwt-token-for-${newUser.id}`
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token || !token.startsWith('mock-jwt-token-for-')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.replace('mock-jwt-token-for-', '');
    const user = dbService.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash: _, ...profile } = user;
    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
