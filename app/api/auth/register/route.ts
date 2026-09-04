import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signEmailToken } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password, displayName } = await req.json();

    // Validate
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    // Check existing
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      displayName: displayName || username,
    });

    // Send activation email
    const activationToken = signEmailToken({ userId: user._id.toString(), type: 'activate' });
    await sendActivationEmail(email, username, activationToken);

    return NextResponse.json(
      { message: 'Account created! Check your email to activate your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
