import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyEmailToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token } = await req.json();

    const payload = verifyEmailToken(token);
    if (!payload || payload.type !== 'activate') {
      return NextResponse.json({ error: 'Invalid or expired activation link' }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Account already activated' });
    }

    user.isVerified = true;
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    return NextResponse.json({ message: 'Account activated successfully! You can now log in.' });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
  }
}
