import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Story from '@/models/Story';
import { getServerUser } from '@/lib/auth';
import Purchase from '@/models/Purchase';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const user = await getServerUser();

    const story = await Story.findOne({ slug }).lean() as Record<string, unknown> | null;
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    const isOwner = user?.username === story.authorUsername;
    if (!story.isPublished && !isOwner) {
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
    if (story.isPublished) {
      await Story.findByIdAndUpdate((story as any)._id, { $inc: { totalViews: 1 } });
    }

    return NextResponse.json({ story: { ...story, versions } });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const source = await Story.findOne({ slug, isPublished: true });
    if (!source) return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    const purchases = await Purchase.find({ buyer: user.userId, story: source._id, status: 'completed' }).lean();
    const purchasedIds = new Set(purchases.map((purchase) => purchase.versionId));
    const accessibleVersions = source.versions
      .filter((version: { isFree: boolean; _id: { toString(): string } }) =>
        source.authorUsername === user.username || version.isFree || purchasedIds.has(version._id.toString()))
    if (accessibleVersions.length === 0) {
      return NextResponse.json({ error: 'Purchase a version before creating a continuation' }, { status: 402 });
    }
    const isContinuation = body.action === 'continue';
    const selectedVersion = isContinuation && body.versionId
      ? accessibleVersions.find((version: { _id: { toString(): string } }) => version._id.toString() === body.versionId)
      : undefined;
    if (isContinuation && !selectedVersion) {
      return NextResponse.json({ error: 'Select an accessible version to continue' }, { status: 400 });
    }
    const versions = (selectedVersion ? [selectedVersion] : accessibleVersions)
      .map((version: { title: string; content: string; summary: string }) => ({
        title: version.title, content: version.content, summary: version.summary,
        isFree: true, price: 0, purchasedBy: [], viewCount: 0, likeCount: 0,
      }));
    const title = isContinuation ? `Continuation of ${source.title}` : `Branch of ${source.title}`;
    const clone = await Story.create({
      title, slug: `${slugify(title, { lower: true, strict: true })}-${uuidv4().slice(0, 8)}`,
      description: source.description, genre: source.genre, tags: source.tags, language: source.language,
      author: user.userId, authorUsername: user.username, versions,
      originStory: source._id, originSlug: source.slug,
      originType: isContinuation ? 'continuation' : 'clone',
      totalVersions: versions.length, freeVersions: versions.length, paidVersions: 0,
      readingTime: source.readingTime, isPublished: false,
    });
    return NextResponse.json({ story: clone }, { status: 201 });
  } catch (error) {
    console.error('Clone story error:', error);
    return NextResponse.json({ error: 'Failed to clone story' }, { status: 500 });
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
