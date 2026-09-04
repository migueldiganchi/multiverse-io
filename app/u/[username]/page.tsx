'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StoryCard from '@/components/StoryCard';
import { BookOpen, Eye, GitBranch, Loader2, ArrowLeft } from 'lucide-react';

interface ProfileUser {
  username: string;
  displayName: string;
  bio: string;
  plan: string;
  storiesCount: number;
  createdAt: string;
}

interface Story {
  _id: string;
  title: string;
  slug: string;
  description: string;
  authorUsername: string;
  genre: string[];
  totalVersions: number;
  freeVersions: number;
  paidVersions: number;
  totalViews: number;
  totalLikes: number;
  readingTime: number;
  createdAt: string;
}

function ProfileContent({ username }: { username: string }) {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/stories?author=${username}&limit=20`).then((r) => r.json()),
    ]).then(([storiesData]) => {
      setStories(storiesData.stories || []);
      if (storiesData.stories?.length > 0) {
        setProfileUser({
          username,
          displayName: username,
          bio: '',
          plan: 'free',
          storiesCount: storiesData.stories.length,
          createdAt: storiesData.stories[0]?.createdAt,
        });
      }
      setLoading(false);
    });
  }, [username]);

  const totalViews = stories.reduce((a: number, s: Story) => a + s.totalViews, 0);
  const totalVersions = stories.reduce((a: number, s: Story) => a + s.totalVersions, 0);

  if (loading) return (
    <div className="min-h-screen bg-[var(--void)] flex items-center justify-center">
      <Loader2 className="text-[var(--aurora)] animate-spin" size={28} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <Link href="/explore" className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] font-mono mb-8 transition-colors">
          <ArrowLeft size={14} /> EXPLORE
        </Link>

        {/* Profile header */}
        <div className="border border-[var(--border)] bg-[var(--deep)] p-8 mb-10">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 border border-[var(--aurora)] bg-[var(--aurora-dim)] flex items-center justify-center text-xl font-mono font-bold text-[var(--aurora)] flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl font-light text-[var(--text-bright)] mb-1">
                {profileUser?.displayName || username}
              </h1>
              <p className="text-sm text-[var(--muted)] font-mono mb-3">@{username}</p>
              {profileUser?.bio && <p className="text-[var(--text-dim)]">{profileUser.bio}</p>}

              <div className="flex items-center gap-8 mt-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                  <BookOpen size={12} /> {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                  <Eye size={12} /> {totalViews.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                  <GitBranch size={12} /> {totalVersions} versions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stories */}
        <div>
          <p className="text-xs font-mono tracking-widest text-[var(--text-dim)] mb-6">STORIES BY @{username.toUpperCase()}</p>
          {stories.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--border)]">
              <p className="font-display text-2xl text-[var(--text-dim)]">No stories yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return (
    <AuthProvider>
      <ProfileContent username={username} />
    </AuthProvider>
  );
}
