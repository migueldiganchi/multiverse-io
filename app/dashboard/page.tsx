'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import {
  BookOpen, GitBranch, Eye, DollarSign, PenTool,
  Loader2, TrendingUp, Lock, Unlock, Plus, ExternalLink
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  totalVersions: number;
  freeVersions: number;
  paidVersions: number;
  totalViews: number;
  totalEarnings: number;
  totalPurchases: number;
  createdAt: string;
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stories' | 'earnings'>('stories');

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/stories?author=${user.username}&limit=50`)
      .then((r) => r.json())
      .then((d) => { setStories(d.stories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const totalViews = stories.reduce((a, s) => a + s.totalViews, 0);
  const totalEarnings = stories.reduce((a, s) => a + s.totalEarnings, 0);
  const totalVersions = stories.reduce((a, s) => a + s.totalVersions, 0);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="text-xs font-mono tracking-widest text-[var(--aurora)] mb-3">DASHBOARD</p>
            <h1 className="font-display text-5xl font-light text-[var(--text-bright)]">
              {user.displayName || user.username}
            </h1>
            <p className="text-[var(--text-dim)] mt-1 font-mono text-sm">@{user.username}</p>
          </div>
          <Link href="/write" className="btn-primary">
            <Plus size={16} /> New story
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Stories', value: stories.length, icon: <BookOpen size={18} />, color: 'var(--aurora)' },
            { label: 'Total views', value: totalViews.toLocaleString(), icon: <Eye size={18} />, color: 'var(--cyan)' },
            { label: 'Versions', value: totalVersions, icon: <GitBranch size={18} />, color: 'var(--gold)' },
            { label: 'Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: <DollarSign size={18} />, color: 'var(--pulse)' },
          ].map((stat) => (
            <div key={stat.label} className="border border-[var(--border)] bg-[var(--deep)] p-6">
              <div style={{ color: stat.color }} className="mb-3">{stat.icon}</div>
              <div className="font-display text-3xl font-light text-[var(--text-bright)] mb-1">{stat.value}</div>
              <div className="text-xs font-mono tracking-wider text-[var(--text-dim)]">{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Subscription badge */}
        <div className="border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-[var(--gold)]" />
            <span className="text-sm text-[var(--text-mid)]">
              Current plan: <span className="text-[var(--text)] font-mono uppercase tracking-wider">{user.plan}</span>
            </span>
          </div>
          {user.plan === 'free' && (
            <Link href="/pricing" className="text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors font-mono">
              Upgrade → 
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[var(--border)] mb-8">
          {(['stories', 'earnings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-mono tracking-wider transition-all border-b-2 -mb-px ${
                tab === t
                  ? 'border-[var(--aurora)] text-[var(--aurora)]'
                  : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text)]'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stories tab */}
        {tab === 'stories' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="text-[var(--aurora)] animate-spin" size={28} />
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-[var(--border)]">
                <PenTool className="mx-auto mb-4 text-[var(--muted)]" size={32} />
                <p className="font-display text-2xl text-[var(--text-dim)] mb-3">No stories yet</p>
                <p className="text-sm text-[var(--muted)] mb-6">Your first story is the beginning of a universe.</p>
                <Link href="/write" className="btn-primary">Write your first story</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stories.map((story) => (
                  <div key={story._id} className="border border-[var(--border)] bg-[var(--deep)] p-5 flex items-center justify-between gap-4 hover:border-[var(--border-soft)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-lg font-light text-[var(--text-bright)] truncate">{story.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 border flex-shrink-0 ${
                          story.isPublished
                            ? 'border-emerald-500/30 text-emerald-500'
                            : 'border-[var(--muted)] text-[var(--muted)]'
                        }`}>
                          {story.isPublished ? 'LIVE' : 'DRAFT'}
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-xs text-[var(--text-dim)] font-mono">
                        <span className="flex items-center gap-1"><Eye size={11} /> {story.totalViews}</span>
                        <span className="flex items-center gap-1"><GitBranch size={11} /> {story.totalVersions} versions</span>
                        {story.freeVersions > 0 && (
                          <span className="flex items-center gap-1 text-emerald-500"><Unlock size={11} /> {story.freeVersions}</span>
                        )}
                        {story.paidVersions > 0 && (
                          <span className="flex items-center gap-1 text-[var(--gold)]"><Lock size={11} /> {story.paidVersions}</span>
                        )}
                        {story.totalEarnings > 0 && (
                          <span className="flex items-center gap-1 text-[var(--pulse)]"><DollarSign size={11} /> ${story.totalEarnings.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Link
                        href={`/story/${story.slug}`}
                        className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
                        title="View story"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                        href={`/write/edit/${story.slug}`}
                        className="text-xs border border-[var(--border-soft)] text-[var(--text-dim)] px-3 py-1.5 hover:border-[var(--aurora)] hover:text-[var(--aurora)] transition-all font-mono"
                      >
                        EDIT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Earnings tab */}
        {tab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Total earned', value: `$${totalEarnings.toFixed(2)}`, sub: 'Lifetime' },
                { label: 'Platform takes', value: '20%', sub: 'Per transaction' },
                { label: 'Your cut', value: '80%', sub: 'Per transaction' },
              ].map((item) => (
                <div key={item.label} className="border border-[var(--border)] bg-[var(--deep)] p-6">
                  <p className="text-xs font-mono tracking-widest text-[var(--text-dim)] mb-2">{item.label.toUpperCase()}</p>
                  <p className="font-display text-4xl font-light text-[var(--text-bright)]">{item.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="border border-[var(--border)] bg-[var(--deep)] p-6">
              <h3 className="text-xs font-mono tracking-widest text-[var(--text-dim)] mb-4">REVENUE BY STORY</h3>
              {stories.filter((s) => s.totalEarnings > 0).length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-8 text-center">No earnings yet. Add paid versions to your stories to start earning.</p>
              ) : (
                <div className="space-y-3">
                  {stories
                    .filter((s) => s.totalEarnings > 0)
                    .sort((a, b) => b.totalEarnings - a.totalEarnings)
                    .map((story) => (
                      <div key={story._id} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text)] truncate">{story.title}</p>
                          <p className="text-xs text-[var(--muted)]">{story.totalPurchases} purchases</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-[var(--gold)]">${story.totalEarnings.toFixed(2)}</p>
                        </div>
                        <div className="w-32 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--gold)]"
                            style={{ width: `${Math.min((story.totalEarnings / totalEarnings) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
