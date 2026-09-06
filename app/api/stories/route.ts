import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Story from '@/models/Story';
import { getServerUser } from '@/lib/auth';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 12);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    const featured = searchParams.get('featured');
    const user = await getServerUser();

    const query: Record<string, unknown> = { isPublished: true };
    if (genre) query.genre = genre;
    if (author) {
      query.authorUsername = author;
      if (user?.username === author) {
        delete query.isPublished;
      }
    }
    if (featured) query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const total = await Story.countDocuments(query);
    const stories = await Story.find(query)
      .select('-versions.content')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      stories,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get stories error:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { title, description, genre, tags, language } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;

    const story = await Story.create({
      title,
      slug,
      description,
      genre: genre ?? [],
      tags: tags ?? [],
      language: language ?? 'en',
      author: user.userId,
      authorUsername: user.username,
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error('Create story error:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
