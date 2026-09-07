'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createLoginUrl } from '@/lib/auth-redirect';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft, Plus, Save, Loader2, Lock, Unlock,
  Eye, EyeOff, Sparkles, X, GitBranch, Globe, GlobeLock
} from 'lucide-react';

interface Version {
  _id: string;
  title: string;
  content: string;
  summary: string;
  isFree: boolean;
  price: number | '';
  viewCount: number;
  likeCount: number;
  mediaType?: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  choices?: { label: string; targetVersionId: string }[];
}

interface Story {
  _id: string;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  tags: string[];
  isPublished: boolean;
  versions: Version[];
  authorUsername: string;
}

function EditStoryContent({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeVersion, setActiveVersion] = useState<Version | null>(null);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [preview, setPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newVersion, setNewVersion] = useState<{ title: string; content: string; summary: string; isFree: boolean; price: number | ''; mediaType: 'text' | 'audio' | 'video'; mediaUrl: string; choices: { label: string; targetVersionId: string }[] }>({ title: '', content: '', summary: '', isFree: true, price: 1.99, mediaType: 'text', mediaUrl: '', choices: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(createLoginUrl(`${window.location.pathname}${window.location.search}`));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch(`/api/stories/${slug}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Story not found');
        return data;
      })
      .then((d) => {
        if (d.story) {
          setStory(d.story);
          const newChapter = new URLSearchParams(window.location.search).get('new') === 'chapter';
          if (newChapter) setShowNewVersion(true);
          else if (d.story.versions.length > 0) setActiveVersion(d.story.versions[0]);
        }
        setLoading(false);
      })
      .catch((loadError: Error) => {
        setError(loadError.message);
        setLoading(false);
      });
    const created = new URLSearchParams(window.location.search).get('created');
    if (created === 'clone') setSuccess('Branch cloned successfully. You can now edit your copy.');
    if (created === 'continuation') setSuccess('Continuation created successfully. Add the next version here.');
  }, [slug]);

  const saveVersionEdit = async () => {
    if (!activeVersion || !story) return;
    if (!activeVersion.isFree && (activeVersion.price === '' || activeVersion.price < 0.99)) {
      setError('Paid versions require a price of at least $0.99');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/stories/${story.slug}/versions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId: activeVersion._id, ...activeVersion, price: activeVersion.price === '' ? undefined : activeVersion.price }),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess('Version saved');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Failed to save');
    }
  };

  const addNewVersion = async () => {
    if (!story || !newVersion.title || !newVersion.content) {
      setError('Title and content required');
      return;
    }
    if (!newVersion.isFree && (newVersion.price === '' || newVersion.price < 0.99)) {
      setError('Paid versions require a price of at least $0.99');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/stories/${story.slug}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newVersion, price: newVersion.price === '' ? undefined : newVersion.price }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setStory((s) => s ? { ...s, versions: [...s.versions, data.version] } : s);
      setActiveVersion(data.version);
      setShowNewVersion(false);
      setNewVersion({ title: '', content: '', summary: '', isFree: true, price: 1.99, mediaType: 'text', mediaUrl: '', choices: [] });
      setSuccess('Version added!');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(data.error);
    }
  };

  const togglePublish = async () => {
    if (!story) return;
    setSaving(true);
    const res = await fetch(`/api/stories/${story.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !story.isPublished }),
    });
    if (res.ok) {
      setStory((s) => s ? { ...s, isPublished: !s.isPublished } : s);
      setSuccess(story.isPublished ? 'Story unpublished' : 'Story published!');
      setTimeout(() => setSuccess(''), 2000);
    }
    setSaving(false);
  };

  const generateAI = async (type: 'story' | 'alternate-ending') => {
    if (!aiPrompt || !story) return;
    setAiLoading(true);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        prompt: aiPrompt,
        storyTitle: story.title,
        storyDescription: story.description,
        existingVersions: story.versions.map((v) => ({ title: v.title, summary: v.summary })),
      }),
    });
    const data = await res.json();
    setAiLoading(false);
    if (data.content) {
      if (showNewVersion) {
        setNewVersion((f) => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + data.content }));
      } else if (activeVersion) {
        setActiveVersion((v) => v ? { ...v, content: v.content + (v.content ? '\n\n' : '') + data.content } : v);
      }
      setShowAiPanel(false);
      setAiPrompt('');
    }
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[var(--void)] flex items-center justify-center">
      <Loader2 className="text-[var(--aurora)] animate-spin" size={28} />
    </div>
  );

  if (!story) return (
    <div className="min-h-screen bg-[var(--void)] flex items-center justify-center">
      <p className="text-[var(--text-dim)]">Story not found.</p>
    </div>
  );

  const editingVersion = showNewVersion ? newVersion : activeVersion;
  const setEditingVersion = showNewVersion
    ? (fn: (v: typeof newVersion) => typeof newVersion) => setNewVersion(fn)
    : (fn: (v: Version) => Version) => setActiveVersion((v) => v ? fn(v) : v);

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] font-mono transition-colors">
            <ArrowLeft size={14} /> DASHBOARD
          </Link>
          <div className="flex items-center gap-3">
            {success && <span className="text-xs text-emerald-500 font-mono">{success}</span>}
            {error && <span className="text-xs text-[var(--pulse)] font-mono">{error}</span>}
            <button
              onClick={togglePublish}
              className={`flex items-center gap-2 text-xs border px-3 py-2 font-mono transition-all ${
                story.isPublished
                  ? 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                  : 'border-[var(--border-soft)] text-[var(--text-dim)] hover:border-[var(--aurora)]'
              }`}
              disabled={saving}
            >
              {story.isPublished ? <><Globe size={12} /> LIVE</> : <><GlobeLock size={12} /> DRAFT</>}
            </button>
            <Link href={`/story/${story.slug}`} className="btn-ghost text-xs py-2 px-3">
              <Eye size={12} /> Preview
            </Link>
          </div>
        </div>

        <h1 className="font-display text-4xl font-light text-[var(--text-bright)] mb-2">{story.title}</h1>
        <p className="text-sm text-[var(--text-dim)] mb-10">{story.description}</p>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Version sidebar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono tracking-widest text-[var(--text-dim)]">VERSIONS</span>
              <button
                onClick={() => { setShowNewVersion(true); setActiveVersion(null); }}
                className="text-xs text-[var(--aurora)] hover:text-[var(--text)] flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            <div className="space-y-1">
              {story.versions.map((v, i) => (
                <button
                  key={v._id}
                  onClick={() => { setActiveVersion(v); setShowNewVersion(false); }}
                  className={`w-full text-left p-3 border text-sm transition-all ${
                    activeVersion?._id === v._id && !showNewVersion
                      ? 'border-[var(--aurora)] bg-[var(--surface)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-soft)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-[var(--muted)]">V{i + 1}</span>
                    {v.isFree ? <Unlock size={10} className="text-emerald-500" /> : <Lock size={10} className="text-[var(--gold)]" />}
                  </div>
                  <p className="text-xs leading-snug line-clamp-2">{v.title}</p>
                </button>
              ))}

              {showNewVersion && (
                <div className="border border-dashed border-[var(--aurora)] p-3 bg-[var(--aurora)]/5 text-xs text-[var(--aurora)] font-mono">
                  + NEW VERSION
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            {(activeVersion || showNewVersion) && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono tracking-widest text-[var(--text-dim)]">
                    {showNewVersion ? 'NEW VERSION' : `EDITING: ${activeVersion?.title}`}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAiPanel(true)}
                      className="flex items-center gap-1 text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors"
                    >
                      <Sparkles size={11} /> Bot
                    </button>
                    <button
                      onClick={() => setPreview(!preview)}
                      className="flex items-center gap-1 text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
                    >
                      {preview ? <EyeOff size={11} /> : <Eye size={11} />}
                      {preview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  className="input-base"
                  placeholder="Version title"
                  value={showNewVersion ? newVersion.title : activeVersion?.title ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (showNewVersion) setNewVersion((f) => ({ ...f, title: val }));
                    else setActiveVersion((v) => v ? { ...v, title: val } : v);
                  }}
                />

                <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
                  <select
                    className="input-base"
                    value={showNewVersion ? newVersion.mediaType : activeVersion?.mediaType ?? 'text'}
                    onChange={(e) => {
                      const mediaType = e.target.value as 'text' | 'audio' | 'video';
                      if (showNewVersion) setNewVersion((f) => ({ ...f, mediaType }));
                      else setActiveVersion((v) => v ? { ...v, mediaType } : v);
                    }}
                  >
                    <option value="text">Text node</option>
                    <option value="audio">Audio node</option>
                    <option value="video">Video node</option>
                  </select>
                  <input
                    type="url"
                    className="input-base"
                    placeholder="Media URL (optional)"
                    value={showNewVersion ? newVersion.mediaUrl : activeVersion?.mediaUrl ?? ''}
                    onChange={(e) => {
                      const mediaUrl = e.target.value;
                      if (showNewVersion) setNewVersion((f) => ({ ...f, mediaUrl }));
                      else setActiveVersion((v) => v ? { ...v, mediaUrl } : v);
                    }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-mono tracking-widest text-[var(--text-dim)]">BRANCHING CHOICES (JSON)</label>
                  <textarea
                    className="input-base min-h-20 resize-y font-mono text-xs"
                    placeholder={'[{"label":"Enter the forest","targetVersionId":"NODE_ID"}]'}
                    value={JSON.stringify(showNewVersion ? newVersion.choices : activeVersion?.choices ?? [])}
                    onChange={(e) => {
                      try {
                        const choices = JSON.parse(e.target.value);
                        if (!Array.isArray(choices)) return;
                        if (showNewVersion) setNewVersion((f) => ({ ...f, choices }));
                        else setActiveVersion((v) => v ? { ...v, choices } : v);
                      } catch {
                        // Keep the last valid value while the author is typing.
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">Connect this node to another node using its ID. Leave empty for a linear chapter.</p>
                </div>

                <input
                  type="text"
                  className="input-base"
                  placeholder="Short summary (shown as teaser)"
                  value={showNewVersion ? newVersion.summary : activeVersion?.summary ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (showNewVersion) setNewVersion((f) => ({ ...f, summary: val }));
                    else setActiveVersion((v) => v ? { ...v, summary: val } : v);
                  }}
                />

                {preview ? (
                  <div
                    className="story-prose bg-[var(--deep)] border border-[var(--border)] p-6 min-h-64"
                    dangerouslySetInnerHTML={{
                      __html: (showNewVersion ? newVersion.content : activeVersion?.content ?? '').replace(/\n/g, '<br />') ||
                        '<em style="color:var(--muted)">Nothing to preview.</em>'
                    }}
                  />
                ) : (
                  <>
                    <textarea
                      className="input-base resize-none font-[Georgia,serif] text-base leading-relaxed"
                      rows={18}
                      placeholder="Write your story..."
                      value={showNewVersion ? newVersion.content : activeVersion?.content ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (showNewVersion) setNewVersion((f) => ({ ...f, content: val }));
                        else setActiveVersion((v) => v ? { ...v, content: val } : v);
                      }}
                    />
                  </>
                )}

                {/* Pricing row */}
                <div className="flex flex-wrap items-center gap-4 border border-[var(--border)] p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (showNewVersion) setNewVersion((f) => ({ ...f, isFree: true }));
                        else setActiveVersion((v) => v ? { ...v, isFree: true } : v);
                      }}
                      className={`flex items-center gap-1.5 text-xs border px-3 py-2 transition-all ${
                        (showNewVersion ? newVersion.isFree : activeVersion?.isFree)
                          ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                          : 'border-[var(--border)] text-[var(--text-dim)]'
                      }`}
                    >
                      <Unlock size={12} /> Free
                    </button>
                    <button
                      onClick={() => {
                        if (showNewVersion) setNewVersion((f) => ({ ...f, isFree: false }));
                        else setActiveVersion((v) => v ? { ...v, isFree: false } : v);
                      }}
                      className={`flex items-center gap-1.5 text-xs border px-3 py-2 transition-all ${
                        !(showNewVersion ? newVersion.isFree : activeVersion?.isFree)
                          ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10'
                          : 'border-[var(--border)] text-[var(--text-dim)]'
                      }`}
                    >
                      <Lock size={12} /> Paid
                    </button>
                  </div>

                  {!(showNewVersion ? newVersion.isFree : activeVersion?.isFree) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-dim)]">$</span>
                      <input
                        type="number"
                        className="input-base w-24 py-2"
                        min="0.99"
                        max="99.99"
                        step="0.50"
                        value={showNewVersion ? newVersion.price : activeVersion?.price ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          if (showNewVersion) setNewVersion((f) => ({ ...f, price: val }));
                          else setActiveVersion((v) => v ? { ...v, price: val } : v);
                        }}
                      />
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    {showNewVersion ? (
                      <>
                        <button
                          onClick={() => setShowNewVersion(false)}
                          className="btn-ghost text-xs py-2 px-3"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addNewVersion}
                          className="btn-primary text-xs py-2 px-4"
                          disabled={saving}
                        >
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          Add version
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={saveVersionEdit}
                        className="btn-primary text-xs py-2 px-4"
                        disabled={saving}
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save version
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {!activeVersion && !showNewVersion && (
              <div className="border border-dashed border-[var(--border)] p-12 text-center">
                <GitBranch className="mx-auto mb-3 text-[var(--muted)]" size={28} />
                <p className="text-sm text-[var(--text-dim)] mb-4">Select a version to edit, or add a new one.</p>
                <button onClick={() => setShowNewVersion(true)} className="btn-ghost text-sm">
                  <Plus size={14} /> Add first version
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!showAiPanel && (
        <button className="story-assistant-launcher" onClick={() => setShowAiPanel(true)} aria-label="Open story bot">
          <Sparkles size={17} /> <span>Bot</span>
        </button>
      )}

      {/* Floating AI story assistant */}
      {showAiPanel && (
        <div className="story-assistant-panel">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[var(--aurora)]" size={20} />
                <div><h3 className="font-display text-xl font-light text-[var(--text-bright)]">Story bot</h3><p className="text-xs text-[var(--text-dim)]">Tell me what should happen next.</p></div>
              </div>
              <button onClick={() => setShowAiPanel(false)} className="text-[var(--muted)] hover:text-[var(--text)]">
                <X size={18} />
              </button>
            </div>
            <textarea
              className="input-base resize-none mb-4"
              rows={4}
              placeholder="What should I create?"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => generateAI('story')}
              disabled={aiLoading || !aiPrompt}
              className="btn-ghost text-sm justify-center"
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Create
            </button>
            </div>
          </div>
      )}
    </div>
  );
}

export default function EditStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <AuthProvider>
      <EditStoryContent slug={slug} />
    </AuthProvider>
  );
}
