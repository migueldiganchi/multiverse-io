'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createLoginUrl } from '@/lib/auth-redirect';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Notification from '@/components/Notification';
import {
  ArrowLeft, Plus, Save, Loader2, Lock, Unlock,
  Eye, EyeOff, Send, Sparkles, Upload, GitBranch, Globe, GlobeLock
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
  nodeType?: 'chapter' | 'alternate';
  parentVersionId?: string;
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
  const [preview, setPreview] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newVersion, setNewVersion] = useState<{ title: string; content: string; summary: string; isFree: boolean; price: number | ''; mediaType: 'text' | 'audio' | 'video'; mediaUrl: string; nodeType: 'chapter' | 'alternate'; parentVersionId: string; choices: { label: string; targetVersionId: string }[] }>({ title: '', content: '', summary: '', isFree: true, price: 1.99, mediaType: 'text', mediaUrl: '', nodeType: 'chapter', parentVersionId: '', choices: [] });
  const [error, setError] = useState('');
  const createdMessage = (() => {
    if (typeof window === 'undefined') return '';
    const created = new URLSearchParams(window.location.search).get('created');
    if (created === 'clone') return 'Branch cloned successfully. You can now edit your copy.';
    if (created === 'continuation') return 'Continuation created successfully. Add the next version here.';
    return '';
  })();
  const [success, setSuccess] = useState(createdMessage);
  const [importing, setImporting] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const importText = async (file: File) => {
    setImporting(true);
    const content = await file.text();
    if (showNewVersion) setNewVersion((current) => ({ ...current, content: current.content ? `${current.content}\n\n${content}` : content }));
    else setActiveVersion((current) => current ? { ...current, content: current.content ? `${current.content}\n\n${content}` : content } : current);
    setImporting(false);
  };

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
          if (newChapter) {
            setShowNewVersion(true);
            setPreview(false);
          } else if (d.story.versions.length > 0) {
            setActiveVersion(d.story.versions[0]);
            setPreview(true);
          }
        }
        setLoading(false);
      })
      .catch((loadError: Error) => {
        setError(loadError.message);
        setLoading(false);
      });
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
      setPreview(true);
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
      setNewVersion({ title: '', content: '', summary: '', isFree: true, price: 1.99, mediaType: 'text', mediaUrl: '', nodeType: 'chapter', parentVersionId: '', choices: [] });
      setSuccess('Version added!');
      setPreview(true);
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
        currentDraft: showNewVersion ? newVersion.content : activeVersion?.content ?? '',
      }),
    });
    const data = await res.json();
    setAiLoading(false);
    if (data.content) {
      setAiResult(data.content);
      setAiStatus('');
      setSuccess('La propuesta está lista. Revisala antes de usarla.');
    }
  };

  const sendPrompt = () => {
    if (!aiPrompt.trim() || aiLoading) return;
    void generateAI('story');
  };

  const useAiResult = () => {
    if (!aiResult) return;
    if (showNewVersion) {
      setNewVersion((f) => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + aiResult }));
    } else if (activeVersion) {
      setActiveVersion((v) => v ? { ...v, content: v.content + (v.content ? '\n\n' : '') + aiResult } : v);
    }
    setAiResult('');
    setAiPrompt('');
    setSuccess('Propuesta aplicada al capítulo.');
    setAiStatus('Listo: agregué la propuesta al capítulo. Ya estoy leyendo este texto para ayudarte a continuar.');
    requestAnimationFrame(() => contentRef.current?.focus());
  };

  const discardAiResult = () => {
    setAiResult('');
    setAiPrompt('');
    setAiStatus('');
    setSuccess('Propuesta descartada. El bot está listo para empezar de nuevo.');
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

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl min-w-0 px-4 pt-24 pb-20 sm:px-6">
        {/* Top bar */}
        <div className="mb-8 flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] font-mono transition-colors">
            <ArrowLeft size={14} /> DASHBOARD
          </Link>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            {success && <Notification type="success" message={success} onDismiss={() => setSuccess('')} />}
            {error && <Notification type="error" message={error} onDismiss={() => setError('')} />}
            <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-dim)] hover:text-[var(--text)]">
              {importing ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />} Import
              <input type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importText(file); event.target.value = ''; }} />
            </label>
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

        <h1 className="mb-2 max-w-full break-words font-display text-4xl font-light text-[var(--text-bright)]">{story.title}</h1>
        <p className="mb-10 max-w-full break-words text-sm text-[var(--text-dim)]">{story.description}</p>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Version sidebar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono tracking-widest text-[var(--text-dim)]">VERSIONS</span>
              <button
                onClick={() => { setShowNewVersion(true); setActiveVersion(null); setPreview(false); }}
                className="text-xs text-[var(--aurora)] hover:text-[var(--text)] flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            <div className="space-y-1">
              {story.versions.map((v, i) => (
                <button
                  key={v._id}
                  onClick={() => { setActiveVersion(v); setShowNewVersion(false); setPreview(true); }}
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
          <div className="min-w-0 space-y-4">
            {(activeVersion || showNewVersion) && (
              <>
                <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <h3 className="max-w-full break-words text-xs font-mono tracking-widest text-[var(--text-dim)]">
                    {showNewVersion ? 'NEW VERSION' : `EDITING: ${activeVersion?.title}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
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

                <fieldset disabled={preview} className="contents">
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

                <div className="grid gap-3 sm:grid-cols-[9rem_10rem_1fr]">
                  <select
                    className="input-base"
                    value={showNewVersion ? newVersion.nodeType : activeVersion?.nodeType ?? 'chapter'}
                    onChange={(e) => {
                      const nodeType = e.target.value as 'chapter' | 'alternate';
                      if (showNewVersion) setNewVersion((f) => ({ ...f, nodeType }));
                      else setActiveVersion((v) => v ? { ...v, nodeType } : v);
                    }}
                    aria-label="Node type"
                  >
                    <option value="chapter">Chapter</option>
                    <option value="alternate">Alternate</option>
                  </select>
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
                  <select
                    className="input-base"
                    value={showNewVersion ? newVersion.parentVersionId : activeVersion?.parentVersionId ?? ''}
                    onChange={(e) => {
                      const parentVersionId = e.target.value;
                      if (showNewVersion) setNewVersion((f) => ({ ...f, parentVersionId }));
                      else setActiveVersion((v) => v ? { ...v, parentVersionId } : v);
                    }}
                    aria-label="Parent node"
                  >
                    <option value="">Root node</option>
                    {story.versions.map((version) => <option key={version._id} value={version._id}>{version.title}</option>)}
                  </select>
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
                    className="preview-content story-prose min-h-64 w-full max-w-full overflow-x-hidden break-words border border-[var(--border)] bg-[var(--deep)] p-4 sm:p-6"
                    dangerouslySetInnerHTML={{
                      __html: (showNewVersion ? newVersion.content : activeVersion?.content ?? '').replace(/\n/g, '<br />') ||
                        '<em style="color:var(--muted)">Nothing to preview.</em>'
                    }}
                  />
                ) : (
                  <>
                    <textarea
                      ref={contentRef}
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
                </fieldset>
              </>
            )}

            {!activeVersion && !showNewVersion && (
              <div className="border border-dashed border-[var(--border)] p-12 text-center">
                <GitBranch className="mx-auto mb-3 text-[var(--muted)]" size={28} />
                <p className="text-sm text-[var(--text-dim)] mb-4">Select a version to edit, or add a new one.</p>
                <button onClick={() => { setShowNewVersion(true); setPreview(false); }} className="btn-ghost text-sm">
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
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="text-[var(--aurora)]" size={20} />
            <div><h3 className="font-display text-xl font-light text-[var(--text-bright)]">Story bot</h3><p className="text-xs text-[var(--text-dim)]">Tell me what should happen next.</p></div>
          </div>
          <textarea
            ref={promptRef}
            className="input-base resize-none mb-4"
            rows={4}
            placeholder="What should I create?"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendPrompt();
              }
            }}
          />
          {aiLoading && <div className="ai-status" role="status"><Loader2 size={14} className="animate-spin" /> <span>Estoy leyendo el capítulo y preparando una propuesta...</span></div>}
          {aiResult && (
            <div className="ai-result-card" role="status">
              <p className="ai-result-label">Resultado</p>
              <div className="ai-result-content">{aiResult}</div>
              <div className="ai-result-actions">
                <button type="button" onClick={useAiResult} className="btn-primary">Usar</button>
                <button type="button" onClick={sendPrompt} disabled={aiLoading || !aiPrompt.trim()} className="btn-ghost">Regenerar</button>
                <button type="button" onClick={discardAiResult} className="btn-ghost">Descartar</button>
              </div>
            </div>
          )}
          {aiStatus && <div className="ai-status" role="status"><Sparkles size={14} /> <span>{aiStatus}</span></div>}
          {!aiResult && <div className="mb-4 flex flex-wrap gap-2">
          {['Tensión', 'Misterio', 'Giro'].map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => {
                setAiPrompt(suggestion);
                requestAnimationFrame(() => promptRef.current?.focus());
              }} className="chat-suggestion">{suggestion}</button>
            ))}
          </div>}
          <div className="chat-actions">
            <button type="button" onClick={() => setShowAiPanel(false)} className="btn-ghost chat-close">Cerrar</button>
            <button type="button" onClick={sendPrompt} disabled={!aiPrompt.trim() || aiLoading} className="btn-primary chat-send">
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar
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
