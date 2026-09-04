import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const payload = await getServerUser();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
