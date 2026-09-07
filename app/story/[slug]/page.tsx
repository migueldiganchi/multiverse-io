'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { createLoginUrl } from '@/lib/auth-redirect';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock, Copy, Eye,
  Edit3, GitBranch, GitFork, Headphones, Layers3, Link2, Loader2, Lock, Map,
  MessageCircle, Play, Share2, ShoppingCart, Sparkles, Volume2, Video, X,
} from 'lucide-react';

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
  mediaType?: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  choices?: { label: string; targetVersionId: string }[];
}

interface Story {
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

function ActionButton({
  icon,
  children,
  onClick,
  disabled,
  primary = false,
  label,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`story-action-button ${primary ? 'btn-primary' : 'btn-ghost'} disabled:opacity-40`}
    >
      {icon}<span>{children}</span>
    </button>
  );
}

function StoryContent({ slug }: { slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'clone' | 'continue' | 'all' | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [readerPreview, setReaderPreview] = useState(false);

  const redirectToLogin = () => router.push(createLoginUrl(`${window.location.pathname}${window.location.search}`));

  useEffect(() => {
    fetch(`/api/stories/${slug}`)
      .then((response) => response.json())
      .then((data) => {
        setStory(data.story);
        setSelectedVersion(data.story?.versions?.[0] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const isOwner = user?.username === story?.authorUsername;
  const pages = useMemo(() => selectedVersion?.content
    ? selectedVersion.content.split(/\n\s*\n/).reduce<string[]>((result, paragraph) => {
      const previous = result[result.length - 1];
      if (previous && previous.length < 760) result[result.length - 1] = `${previous}\n\n${paragraph}`;
      else result.push(paragraph);
      return result;
    }, [])
    : [], [selectedVersion]);
  const currentPage = pages[page] ?? '';
  const progress = pages.length ? ((page + 1) / pages.length) * 100 : 0;

  const selectVersion = (version: Version) => {
    if (version.isLocked) return;
    setSelectedVersion(version);
    setPage(0);
    setMapOpen(false);
  };

  const goToVersion = (versionId: string) => {
    const next = story?.versions.find((version) => version._id === versionId);
    if (next) selectVersion(next);
  };

  const handleShare = async () => {
    const shareData = { title: story?.title, text: story?.description, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice({ type: 'success', text: 'Link copied. Invite someone into this universe.' });
    }
  };

  const handleClone = async () => {
    if (!user) { redirectToLogin(); return; }
    setBusyAction('clone');
    const response = await fetch(`/api/stories/${slug}`, { method: 'POST' });
    const data = await response.json();
    setBusyAction(null);
    if (response.ok) router.push(`/write/edit/${data.story.slug}?created=clone`);
    else setNotice({ type: 'error', text: data.error || 'Unable to clone this branch' });
  };

  const handleContinue = async () => {
    if (!selectedVersion || selectedVersion.isLocked) return;
    if (!user) { redirectToLogin(); return; }
    setBusyAction('continue');
    const response = await fetch(`/api/stories/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'continue', versionId: selectedVersion._id }),
    });
    const data = await response.json();
    setBusyAction(null);
    if (response.ok) router.push(`/write/edit/${data.story.slug}?created=continuation`);
    else setNotice({ type: 'error', text: data.error || 'Unable to create a continuation' });
  };

  const handlePurchase = async (versionId: string) => {
    if (!user) { redirectToLogin(); return; }
    setPurchasing(versionId);
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storySlug: slug, versionId }),
    });
    const data = await response.json();
    setPurchasing(null);
    if (!response.ok) {
      setNotice({ type: 'error', text: data.error || 'Purchase failed' });
      return;
    }
    setStory((current) => current ? {
      ...current,
      versions: current.versions.map((version) => version._id === versionId
        ? { ...version, hasPurchased: true, isLocked: false } : version),
    } : current);
    setSelectedVersion((version) => version?._id === versionId
      ? { ...version, hasPurchased: true, isLocked: false } : version);
    setNotice({ type: 'success', text: 'Path unlocked. Keep exploring.' });
  };

  const handlePurchaseComplete = async () => {
    if (!user) { redirectToLogin(); return; }
    setBusyAction('all');
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storySlug: slug, purchaseAll: true }),
    });
    const data = await response.json();
    setBusyAction(null);
    if (response.ok) {
      setStory((current) => current ? {
        ...current,
        versions: current.versions.map((version) => version.isFree
          ? version : { ...version, hasPurchased: true, isLocked: false }),
      } : current);
      setNotice({ type: 'success', text: 'Every path is unlocked. No spoilers, just possibilities.' });
    } else setNotice({ type: 'error', text: data.error || 'Unable to unlock the story' });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--void)]"><Loader2 className="animate-spin text-[var(--aurora)]" /></div>;
  if (!story) return <div className="flex min-h-screen items-center justify-center bg-[var(--void)]"><div className="text-center"><p className="mb-4 font-display text-3xl text-[var(--text-dim)]">Story not found</p><Link href="/explore" className="btn-ghost">Browse stories</Link></div></div>;

  const lockedPaths = story.versions.filter((version) => version.isLocked).length;
  const showingOwnerTools = isOwner && !readerPreview;

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/explore" className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"><ArrowLeft size={14} /> <span className="hidden sm:inline">BACK TO LIBRARY</span><span className="sm:hidden">LIBRARY</span></Link>
          <div className="flex items-center gap-2">
            <ActionButton icon={<Share2 size={16} />} onClick={handleShare} label="Share story">Share</ActionButton>
            <ActionButton icon={mapOpen ? <X size={16} /> : <Map size={16} />} onClick={() => setMapOpen(!mapOpen)} primary={mapOpen} label="Map">Map</ActionButton>
            {isOwner && <ActionButton icon={readerPreview ? <Edit3 size={16} /> : <Eye size={16} />} onClick={() => setReaderPreview(!readerPreview)} label={readerPreview ? 'Edit' : 'Preview'}>{readerPreview ? 'Edit' : 'Preview'}</ActionButton>}
          </div>
        </div>

        <header className="mb-8 max-w-3xl">
          <div className="mb-4 flex flex-wrap gap-2">
            {story.genre.map((genre) => <span key={genre} className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-[10px] font-mono tracking-widest text-[var(--text-dim)]">{genre.toUpperCase()}</span>)}
          </div>
          <h1 className="mb-4 font-display text-5xl font-light leading-[0.95] text-[var(--text-bright)] sm:text-7xl">{story.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-dim)]">{story.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--muted)]">
            <span className={isOwner ? 'text-[var(--aurora)]' : ''}>{isOwner ? 'YOUR BRANCH' : `@${story.authorUsername}`}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {story.readingTime} min</span>
            <span className="flex items-center gap-1"><GitBranch size={12} /> {story.versions.length} paths</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {story.totalViews.toLocaleString()}</span>
          </div>
        </header>

        {notice && <div className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-[var(--pulse)]/30 bg-[var(--pulse)]/10 text-[var(--pulse)]'}`} role="status"><span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={15} /></button></div>}

        {mapOpen && (
          <section className="story-map mb-8 animate-fade-in" aria-label="Story connections">
            <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow"><Layers3 size={13} /> YOUR UNIVERSE</p><h2 className="mt-2 font-display text-3xl text-[var(--text-bright)]">Choose your way through</h2></div><span className="text-xs font-mono text-[var(--text-dim)]">{story.versions.length} nodes</span></div>
            <div className="flex flex-wrap items-center gap-3">
              {story.versions.map((version, index) => <div key={version._id} className="flex items-center gap-3">
                <button onClick={() => selectVersion(version)} disabled={version.isLocked} className={`story-node ${selectedVersion?._id === version._id ? 'story-node-active' : ''} ${version.isLocked ? 'story-node-locked' : ''}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{version.title}</strong>{version.isLocked ? <Lock size={13} /> : <Play size={13} />}</button>
                {index < story.versions.length - 1 && <ArrowRight size={15} className="text-[var(--muted)]" />}
              </div>)}
            </div>
          </section>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 px-4 py-3">
          <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--aurora)]/15 text-xs font-mono text-[var(--aurora)]">{selectedVersion ? story.versions.indexOf(selectedVersion) + 1 : 0}</span><div><p className="text-sm text-[var(--text-bright)]">{selectedVersion?.title || 'Start your journey'}</p><p className="text-[10px] font-mono text-[var(--text-dim)]">{lockedPaths ? `${lockedPaths} paths waiting` : 'ALL PATHS OPEN'}</p></div></div>
          <div className="flex items-center gap-2"><span className="text-[10px] font-mono text-[var(--text-dim)]">{Math.round(progress)}%</span><div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-[var(--aurora)] to-[var(--cyan)] transition-all" style={{ width: `${progress}%` }} /></div></div>
        </div>

        {selectedVersion && <article className="reader-card">
          <div className="reader-toolbar"><div className="flex items-center gap-2"><span className="eyebrow"><MessageCircle size={13} /> CHAPTER {story.versions.indexOf(selectedVersion) + 1}</span>{selectedVersion.mediaType === 'audio' && <Volume2 size={15} className="text-[var(--aurora)]" />}{selectedVersion.mediaType === 'video' && <Video size={15} className="text-[var(--cyan)]" />}</div><span className="text-xs font-mono text-[var(--text-dim)]">{page + 1} / {Math.max(pages.length, 1)}</span></div>
          {selectedVersion.isLocked ? <div className="reader-lock"><Lock size={34} className="text-[var(--gold)]" /><h2>This path is waiting for you</h2><p>Unlock this alternate experience for ${selectedVersion.price.toFixed(2)}.</p><button onClick={() => handlePurchase(selectedVersion._id)} disabled={purchasing === selectedVersion._id} className="btn-gold">{purchasing === selectedVersion._id ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />} Unlock</button></div> : <>
            {selectedVersion.mediaType === 'audio' && selectedVersion.mediaUrl && <div className="reader-media"><div className="eyebrow"><Headphones size={13} /> AMBIENT SOUND</div><audio className="mt-3 w-full" controls src={selectedVersion.mediaUrl} /></div>}
            {selectedVersion.mediaType === 'video' && selectedVersion.mediaUrl && <div className="reader-video"><video className="max-h-[34rem] w-full object-contain" controls src={selectedVersion.mediaUrl} /><p className="eyebrow mt-3"><Video size={13} /> IMMERSIVE SCENE</p></div>}
            <div className="reader-body"><h2>{selectedVersion.title}</h2><div className="story-prose animate-fade-in" key={`${selectedVersion._id}-${page}`} dangerouslySetInnerHTML={{ __html: currentPage.replace(/\n/g, '<br />') }} /></div>
            <div className="reader-nav"><button onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0} className="reader-nav-button"><ChevronLeft size={18} /><span>Previous</span></button><div className="reader-dots">{pages.map((_, index) => <button key={index} aria-label={`Go to page ${index + 1}`} onClick={() => setPage(index)} className={index === page ? 'active' : ''} />)}</div><button onClick={() => setPage((current) => Math.min(current + 1, Math.max(pages.length - 1, 0)))} disabled={page >= pages.length - 1} className="reader-nav-button next"><span>Next</span><ChevronRight size={18} /></button></div>
            {page >= pages.length - 1 && selectedVersion.choices && selectedVersion.choices.length > 0 && <div className="reader-choices"><p className="eyebrow"><GitFork size={13} /> WHAT HAPPENS NEXT?</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedVersion.choices.map((choice) => <button key={choice.targetVersionId} onClick={() => goToVersion(choice.targetVersionId)} className="choice-card"><span>{choice.label}</span><ArrowRight size={16} /></button>)}</div></div>}
          </>}
        </article>}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {showingOwnerTools ? <>
            <Link href={`/write/edit/${story.slug}`} className="story-action-button btn-primary"><Edit3 size={16} /><span>Edit</span></Link>
            <Link href="/dashboard" className="story-action-button btn-ghost"><Layers3 size={16} /><span>Manage</span></Link>
            <Link href={`/write/edit/${story.slug}?new=chapter`} className="story-action-button btn-ghost"><GitFork size={16} /><span>Chapter</span></Link>
          </> : <>
            {!isOwner && <ActionButton icon={busyAction === 'clone' ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />} onClick={handleClone} disabled={busyAction !== null} label="Clone this story">Clone</ActionButton>}
            {!isOwner && <ActionButton icon={busyAction === 'continue' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} onClick={handleContinue} disabled={busyAction !== null || selectedVersion?.isLocked} primary label="Create">Create</ActionButton>}
            {lockedPaths > 0 && <ActionButton icon={busyAction === 'all' ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />} onClick={handlePurchaseComplete} disabled={busyAction !== null} label="Unlock">Unlock</ActionButton>}
            {!isOwner && <Link href={`/u/${story.authorUsername}`} className="story-action-button btn-ghost"><Link2 size={16} /><span>Author</span></Link>}
          </>}
        </div>
      </main>
    </div>
  );
}

export default function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <AuthProvider><StoryContent slug={slug} /></AuthProvider>;
}
