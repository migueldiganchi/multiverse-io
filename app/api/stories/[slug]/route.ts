import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Story from '@/models/Story';
import { getServerUser } from '@/lib/auth';
import Purchase from '@/models/Purchase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const user = await getServerUser();

    const story = await Story.findOne({ slug, isPublished: true }).lean() as Record<string, unknown> | null;
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Determine which versions user can access
    let purchasedVersionIds: string[] = [];
    if (user) {
      const purchases = await Purchase.find({
        buyer: user.userId,
        story: (story as any)._id,
        status: 'completed',
      }).lean();
      purchasedVersionIds = purchases.map((p) => p.versionId);
    }

    // Filter version content based on access
    const versions = ((story as any).versions as any[]).map((v) => {
      const hasPurchased = purchasedVersionIds.includes(v._id.toString());
      const canRead = v.isFree || hasPurchased || (user && (story as any).authorUsername === user.username);
      return {
        ...v,
        content: canRead ? v.content : null,
        isLocked: !canRead,
        hasPurchased,
      };
    });

    // Increment view count
    await Story.findByIdAndUpdate((story as any)._id, { $inc: { totalViews: 1 } });

    return NextResponse.json({ story: { ...story, versions } });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug } = await params;
    const body = await req.json();

    const story = await Story.findOne({ slug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    if (story.authorUsername !== user.username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowedFields = ['title', 'description', 'genre', 'tags', 'isPublished', 'coverImage', 'language'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (story as any)[field] = body[field];
      }
    }

    await story.save();
    return NextResponse.json({ story });
  } catch (error) {
    console.error('Update story error:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug } = await params;
    const story = await Story.findOne({ slug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    if (story.authorUsername !== user.username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await story.deleteOne();
    return NextResponse.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
