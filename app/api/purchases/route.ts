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
    const { storySlug, versionId, purchaseAll } = await req.json();

    const story = await Story.findOne({ slug: storySlug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const versions = purchaseAll
      ? story.versions.filter((v: { isFree: boolean }) => !v.isFree)
      : story.versions.filter((v: { _id: { toString: () => string } }) => v._id.toString() === versionId);
    if (versions.length === 0) return NextResponse.json({ error: purchaseAll ? 'This story has no paid versions' : 'Version not found' }, { status: 404 });

    if (!purchaseAll && versions[0].isFree) {
      return NextResponse.json({ error: 'This version is free' }, { status: 400 });
    }

    const existing = await Purchase.find({
      buyer: authUser.userId,
      story: story._id,
      versionId: { $in: versions.map((version: { _id: { toString(): string } }) => version._id.toString()) },
      status: 'completed',
    }).lean();

    const purchasedIds = new Set(existing.map((purchase) => purchase.versionId));
    const pendingVersions = versions.filter((version: { _id: { toString(): string } }) => !purchasedIds.has(version._id.toString()));
    if (pendingVersions.length === 0) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    const purchases = [];
    let totalEarnings = 0;
    for (const version of pendingVersions) {
      const amount = Math.round(version.price * 100);
      const platformFee = Math.round(amount * 0.2);
      const sellerEarnings = amount - platformFee;
      purchases.push({
        buyer: authUser.userId, buyerUsername: authUser.username, seller: story.author,
        sellerUsername: story.authorUsername, story: story._id, storyTitle: story.title,
        storySlug: story.slug, versionId: version._id.toString(), versionTitle: version.title,
        amount, platformFee, sellerEarnings, stripePaymentIntentId: `sim_${Date.now()}_${version._id}`,
        status: 'completed',
      });
      version.purchasedBy.push(authUser.userId);
      totalEarnings += sellerEarnings / 100;
    }
    const createdPurchases = await Purchase.insertMany(purchases);
    story.totalPurchases += createdPurchases.length;
    story.totalEarnings += totalEarnings;
    await story.save();

    await User.findByIdAndUpdate(story.author, {
      $inc: { earnings: totalEarnings },
    });

    return NextResponse.json({ purchases: createdPurchases, message: purchaseAll ? 'Complete story unlocked!' : 'Purchase successful!' }, { status: 201 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
