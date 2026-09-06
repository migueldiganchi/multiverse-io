import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Story from '@/models/Story';
import { getServerUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug } = await params;
    const body = await req.json();
    const { title, content, summary, isFree, price, mediaType, mediaUrl, choices } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const story = await Story.findOne({ slug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    if (story.authorUsername !== user.username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    story.versions.push({
      title,
      content,
      summary: summary ?? '',
      isFree: isFree ?? true,
      price: isFree ? 0 : (price ?? 0),
      purchasedBy: [],
      viewCount: 0,
      likeCount: 0,
      mediaType: mediaType ?? 'text',
      mediaUrl: mediaUrl ?? '',
      choices: Array.isArray(choices) ? choices : [],
    } as Parameters<typeof story.versions.push>[0]);

    story.totalVersions = story.versions.length;
    story.freeVersions = story.versions.filter((v: { isFree: boolean }) => v.isFree).length;
    story.paidVersions = story.versions.filter((v: { isFree: boolean }) => !v.isFree).length;

    const totalWords = story.versions.reduce((acc: number, v: { content: string }) => acc + v.content.split(' ').length, 0);
    story.readingTime = Math.ceil(totalWords / 250);

    await story.save();
    return NextResponse.json({ version: story.versions[story.versions.length - 1] }, { status: 201 });
  } catch (error) {
    console.error('Add version error:', error);
    return NextResponse.json({ error: 'Failed to add version' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { slug } = await params;
    const body = await req.json();
    const { versionId, title, content, summary, isFree, price, mediaType, mediaUrl, choices } = body;

    const story = await Story.findOne({ slug });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    if (story.authorUsername !== user.username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const version = story.versions.find((v: { _id: { toString: () => string } }) => v._id.toString() === versionId);
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    if (title !== undefined) version.title = title;
    if (content !== undefined) version.content = content;
    if (summary !== undefined) version.summary = summary;
    if (mediaType !== undefined) version.mediaType = mediaType;
    if (mediaUrl !== undefined) version.mediaUrl = mediaUrl;
    if (choices !== undefined && Array.isArray(choices)) version.choices = choices;
    if (isFree !== undefined) {
      version.isFree = isFree;
      version.price = isFree ? 0 : (price ?? version.price);
    }

    story.freeVersions = story.versions.filter((v: { isFree: boolean }) => v.isFree).length;
    story.paidVersions = story.versions.filter((v: { isFree: boolean }) => !v.isFree).length;

    await story.save();
    return NextResponse.json({ version });
  } catch (error) {
    console.error('Update version error:', error);
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
  }
}
