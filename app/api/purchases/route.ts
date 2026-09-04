import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Story from '@/models/Story';
import Purchase from '@/models/Purchase';
import User from '@/models/User';
import { getServerUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getServerUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { storySlug, versionId } = await req.json();

    const story = await Story.findOne({ slug: storySlug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const version = story.versions.find((v: { _id: { toString: () => string } }) => v._id.toString() === versionId);
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    if (version.isFree) {
      return NextResponse.json({ error: 'This version is free' }, { status: 400 });
    }

    const existing = await Purchase.findOne({
      buyer: authUser.userId,
      story: story._id,
      versionId,
      status: 'completed',
    });

    if (existing) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    const amount = Math.round(version.price * 100);
    const platformFee = Math.round(amount * 0.2);
    const sellerEarnings = amount - platformFee;

    const purchase = await Purchase.create({
      buyer: authUser.userId,
      buyerUsername: authUser.username,
      seller: story.author,
      sellerUsername: story.authorUsername,
      story: story._id,
      storyTitle: story.title,
      storySlug: story.slug,
      versionId,
      versionTitle: version.title,
      amount,
      platformFee,
      sellerEarnings,
      stripePaymentIntentId: `sim_${Date.now()}`,
      status: 'completed',
    });

    version.purchasedBy.push(authUser.userId);
    story.totalPurchases += 1;
    story.totalEarnings += sellerEarnings / 100;
    await story.save();

    await User.findByIdAndUpdate(story.author, {
      $inc: { earnings: sellerEarnings / 100 },
    });

    return NextResponse.json({ purchase, message: 'Purchase successful!' }, { status: 201 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
