'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { GitBranch, Lock, Unlock, Eye, Clock, ArrowLeft, Loader2, ShoppingCart, Sparkles, Edit3, Copy } from 'lucide-react';

interface Version {
  _id: string;
  title: string;
  content: string | null;
  summary: string;
  isFree: boolean;
  price: number;
  isLocked: boolean;
  hasPurchased: boolean;
  viewCount: number;
  likeCount: number;
}

interface Story {
  _id: string;
  title: string;
  slug: string;
  description: string;
  authorUsername: string;
  genre: string[];
  versions: Version[];
  totalViews: number;
  readingTime: number;
  createdAt: string;
}

function StoryContent({ slug }: { slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    fetch(`/api/stories/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setStory(data.story);
        if (data.story.versions.length > 0) {
          setSelectedVersion(data.story.versions[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const isOwner = user?.username === story?.authorUsername;
  const handleClone = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setCloning(true);
    setError('');
    const response = await fetch(`/api/stories/${slug}`, { method: 'POST' });
    const data = await response.json();
    setCloning(false);
    if (response.ok) router.push(`/write/edit/${data.story.slug}`);
    else setError(data.error || 'Unable to clone this branch');
  };

  const handlePurchase = async (versionId: string) => {
    if (!user) { window.location.href = '/auth/login'; return; }
    setPurchasing(versionId);
    setError('');
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storySlug: slug, versionId }),
    });
    const data = await res.json();
    setPurchasing(null);
    if (res.ok) {
      window.location.reload();
    } else {
      setError(data.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--void)]">
        <Loader2 className="text-[var(--aurora)] animate-spin" size={32} />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[var(--void)] flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-[var(--text-dim)] mb-4">Story not found</p>
          <Link href="/explore" className="btn-ghost">Browse stories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Back */}
        <Link href="/explore" className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-8 font-mono">
          <ArrowLeft size={14} /> BACK TO LIBRARY
        </Link>

        {/* Story header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {story.genre.map((g) => (
              <span key={g} className="text-[10px] font-mono tracking-widest border border-[var(--border-soft)] text-[var(--text-dim)] px-2 py-1">
                {g.toUpperCase()}
              </span>
            ))}
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-light text-[var(--text-bright)] mb-4 leading-tight">
            {story.title}
          </h1>
          <p className="text-[var(--text-dim)] text-lg mb-4 max-w-2xl">{story.description}</p>
          <div className="flex items-center gap-6 text-xs text-[var(--muted)] font-mono">
            <span className={isOwner ? 'text-[var(--aurora)]' : ''}>
              {isOwner ? 'YOUR BRANCH' : `BRANCH BY @${story.authorUsername}`}
            </span>
            <span className="flex items-center gap-1"><Eye size={11} /> {story.totalViews.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {story.readingTime}m read</span>
            <span className="flex items-center gap-1"><GitBranch size={11} /> {story.versions.length} versions</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {isOwner ? (
              <Link href={`/write/edit/${story.slug}`} className="btn-primary text-sm">
                <Edit3 size={14} /> Edit branch
              </Link>
            ) : (
              <button onClick={handleClone} disabled={cloning} className="btn-ghost text-sm">
                {cloning ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                {cloning ? 'Cloning...' : 'Clone this branch'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-[var(--pulse)]/10 border border-[var(--pulse)]/30 text-[var(--pulse)] text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Versions sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono tracking-widest text-[var(--text-dim)] mb-4">VERSIONS / BRANCHES</h3>
            {story.versions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No versions yet.</p>
            ) : (
              story.versions.map((v, i) => (
                <div
                  key={v._id}
                  onClick={() => !v.isLocked && setSelectedVersion(v)}
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !v.isLocked) {
                      event.preventDefault();
                      setSelectedVersion(v);
                    }
                  }}
                  role="button"
                  tabIndex={v.isLocked ? -1 : 0}
                  className={`w-full text-left p-4 border transition-all ${
                    selectedVersion?._id === v._id
                      ? 'border-[var(--aurora)] bg-[var(--surface)]'
                      : 'border-[var(--border)] bg-[var(--deep)] hover:border-[var(--border-soft)]'
                  } ${v.isLocked ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--muted)]">V{i + 1}</span>
                    {v.isFree ? (
                      <Unlock size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Lock size={11} className={`flex-shrink-0 mt-0.5 ${v.hasPurchased ? 'text-emerald-500' : 'text-[var(--gold)]'}`} />
                    )}
                  </div>
                  <p className="text-sm text-[var(--text)] font-light leading-snug">{v.title}</p>
                  {v.summary && <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{v.summary}</p>}
                  {!v.isFree && !v.hasPurchased && (
                    <div className="mt-3">
                      <span className="text-xs text-[var(--gold)] font-mono">${v.price.toFixed(2)}</span>
                    </div>
                  )}
                  {!v.isFree && !v.hasPurchased && !v.isLocked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(v._id); }}
                      disabled={purchasing === v._id}
                      className="mt-2 flex items-center gap-1 text-xs text-[var(--gold)] border border-[var(--gold-dim)] px-2 py-1 hover:bg-[var(--gold)]/10 transition-colors"
                    >
                      {purchasing === v._id ? <Loader2 size={11} className="animate-spin" /> : <ShoppingCart size={11} />}
                      Unlock
                    </button>
                  )}
                  {v.isLocked && !v.isFree && !v.hasPurchased && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePurchase(v._id); }}
                      disabled={purchasing === v._id}
                      className="mt-2 flex items-center gap-1 text-xs text-[var(--gold)] border border-[var(--gold-dim)] px-2 py-1 hover:bg-[var(--gold)]/10 transition-colors w-full justify-center"
                    >
                      {purchasing === v._id ? <Loader2 size={11} className="animate-spin" /> : <ShoppingCart size={11} />}
                      Unlock for ${v.price.toFixed(2)}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Content area */}
          <div>
            {selectedVersion ? (
              <div className="border border-[var(--border)] bg-[var(--deep)] p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl font-light text-[var(--text-bright)]">
                    {selectedVersion.title}
                  </h2>
                  {!selectedVersion.isFree && selectedVersion.hasPurchased && (
                    <span className="text-xs font-mono text-emerald-500 border border-emerald-500/30 px-2 py-1">PURCHASED</span>
                  )}
                </div>

                {selectedVersion.isLocked ? (
                  <div className="text-center py-16">
                    <Lock className="mx-auto mb-4 text-[var(--gold)]" size={40} />
                    <p className="font-display text-2xl font-light text-[var(--text-bright)] mb-3">This version is locked</p>
                    <p className="text-[var(--text-dim)] mb-6">Unlock this alternate ending for ${selectedVersion.price.toFixed(2)}</p>
                    <button
                      onClick={() => handlePurchase(selectedVersion._id)}
                      disabled={purchasing === selectedVersion._id}
                      className="btn-gold flex items-center gap-2 mx-auto"
                    >
                      {purchasing === selectedVersion._id ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                      Unlock for ${selectedVersion.price.toFixed(2)}
                    </button>
                  </div>
                ) : (
                  <div className="story-prose" dangerouslySetInnerHTML={{ __html: selectedVersion.content?.replace(/\n/g, '<br />') ?? '' }} />
                )}
              </div>
            ) : (
              <div className="border border-[var(--border)] bg-[var(--deep)] p-12 text-center">
                <Sparkles className="mx-auto mb-4 text-[var(--aurora)]" size={32} />
                <p className="font-display text-xl text-[var(--text-dim)]">Select a version to start reading</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <AuthProvider>
      <StoryContent slug={slug} />
    </AuthProvider>
  );
}
