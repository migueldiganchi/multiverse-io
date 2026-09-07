'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createLoginUrl } from '@/lib/auth-redirect';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Sparkles, Loader2, Lock, Unlock, Save, Eye, EyeOff, ArrowRight, Send } from 'lucide-react';

const GENRES = ['Sci-Fi', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Thriller', 'Literary Fiction', 'Adventure', 'Dystopian'];

function WriteContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'story' | 'version'>('story');
  const [storyForm, setStoryForm] = useState({
    title: '', description: '', genre: [] as string[], tags: '', language: 'en',
  });
  const [versionForm, setVersionForm] = useState({
    title: '', content: '', summary: '', isFree: true, price: 1.99,
  });
  const [createdStory, setCreatedStory] = useState<{ slug: string; _id: string; title: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(createLoginUrl(`${window.location.pathname}${window.location.search}`));
    }
  }, [user, authLoading, router]);

  const toggleGenre = (g: string) => {
    setStoryForm((f) => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g],
    }));
  };

  const createStory = async () => {
    if (!storyForm.title || !storyForm.description) {
      setError('Title and description are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...storyForm,
        tags: storyForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setCreatedStory(data.story);
      setStep('version');
      setNotice('Story created. Now add its first version.');
    } else {
      setError(data.error || 'The story could not be created.');
    }
    } catch {
      setError('Connection failed. Your story was not saved.');
    } finally {
      setSaving(false);
    }
  };

  const saveVersion = async (publish = false) => {
    if (!versionForm.title || !versionForm.content) {
      setError('Version title and content are required');
      return;
    }
    if (!createdStory) return;
    setSaving(true);
    setError('');

    // First save the version
    const vRes = await fetch(`/api/stories/${createdStory.slug}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionForm),
    });

    if (!vRes.ok) {
      const d = await vRes.json();
      setError(d.error);
      setSaving(false);
      return;
    }

    if (publish) {
      // Publish the story
      await fetch(`/api/stories/${createdStory.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true }),
      });
      router.push(`/story/${createdStory.slug}`);
    } else {
      setSaving(false);
      setVersionForm({ title: '', content: '', summary: '', isFree: true, price: 1.99 });
    }
  };

  const generateWithAI = async (type: 'story' | 'alternate-ending' | 'description') => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        prompt: aiPrompt,
        storyTitle: storyForm.title || createdStory?.title,
        storyDescription: storyForm.description,
        genre: storyForm.genre[0],
      }),
    });
    const data = await res.json();
    if (data.content) {
      setAiResult(data.content);
      setNotice('La propuesta está lista. Revisala antes de usarla.');
    }
    } catch {
      setError('The writing assistant could not connect. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateTitles = async () => {
    const prompt = aiPrompt.trim() || storyForm.description.trim() || storyForm.tags.trim() || storyForm.genre.join(', ');
    if (!prompt) {
      setError('Add a description, genre, or a few tags so I can suggest a title.');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'title', prompt, genre: storyForm.genre[0] }),
    });
    const data = await res.json();
    setAiLoading(false);
    if (data.titles?.length > 0) {
      setStoryForm((f) => ({ ...f, title: data.titles[0] }));
      setError('');
      setNotice('Title suggested. You can edit it before continuing.');
    } else {
      setError(data.error || 'I could not suggest a title right now. Try adding a short description.');
    }
    } catch {
      setError('The title assistant could not connect. Check your connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const sendPrompt = () => {
    const prompt = aiPrompt.trim();
    if (!prompt || aiLoading) return;
    void generateWithAI(step === 'story' ? 'story' : 'story');
  };

  const useAiResult = () => {
    if (!aiResult) return;
    if (step === 'story') {
      setStoryForm((f) => ({ ...f, description: aiResult }));
      setNotice('Propuesta aplicada a la historia.');
    } else {
      setVersionForm((f) => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + aiResult }));
      setNotice('Propuesta aplicada al capítulo.');
    }
    setAiResult('');
    setAiPrompt('');
  };

  const discardAiResult = () => {
    setAiResult('');
    setAiPrompt('');
    setNotice('Propuesta descartada. El bot está listo para empezar de nuevo.');
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-[var(--aurora)] mb-3">STUDIO</p>
          <h1 className="font-display text-5xl font-light text-[var(--text-bright)]">
            {step === 'story' ? 'New story' : `${createdStory?.title}`}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-10">
          {['story', 'version'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 border flex items-center justify-center text-xs font-mono transition-all ${
                step === s ? 'border-[var(--aurora)] text-[var(--aurora)] bg-[var(--aurora)]/10' :
                (i === 1 && createdStory) ? 'border-emerald-500 text-emerald-500' :
                'border-[var(--border)] text-[var(--muted)]'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-mono tracking-wider ${step === s ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                {s === 'story' ? 'STORY META' : 'ADD VERSION'}
              </span>
              {i === 0 && <ArrowRight size={14} className="text-[var(--muted)]" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-[var(--pulse)]/10 border border-[var(--pulse)]/30 text-[var(--pulse)] text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400" role="status">
            {notice}
          </div>
        )}

        {/* Story step */}
        {step === 'story' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Title</label>
                  <button
                    onClick={generateTitles}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors disabled:cursor-wait disabled:opacity-60"
                  >
                    {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {aiLoading ? 'Thinking...' : 'Suggest a title'}
                  </button>
                </div>
                <input
                  type="text"
                  className="input-base"
                  placeholder="The last light of parallel worlds..."
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Story pitch</label>
                  <button
                    onClick={() => { setAiPrompt(storyForm.description); setShowAiPanel(true); }}
                    className="flex items-center gap-1 text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors"
                  >
                    <Sparkles size={11} /> Help me write the pitch
                  </button>
                </div>
                <p className="mb-4 text-sm leading-6 text-[var(--text-dim)]">
                  Tell Gemini what you want in plain language. You can write a mood, a character, or a single idea.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {['A mysterious city beneath the ocean', 'A reunion after a timeline split', 'A hopeful ending with a twist'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => { setAiPrompt(suggestion); setShowAiPanel(true); }}
                      className="rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs text-[var(--text-dim)] transition-colors hover:border-[var(--aurora)] hover:text-[var(--text)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-base resize-none"
                  rows={4}
                  placeholder="In one or two sentences, what is this story about?"
                  value={storyForm.description}
                  onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                      storyForm.genre.includes(g)
                        ? 'border-[var(--aurora)] text-[var(--aurora)] bg-[var(--aurora)]/10'
                        : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-soft)]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Tags <span className="text-[var(--muted)]">(comma-separated)</span></label>
              <input
                type="text"
                className="input-base"
                placeholder="time-travel, redemption, dystopia"
                value={storyForm.tags}
                onChange={(e) => setStoryForm({ ...storyForm, tags: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={createStory} className="btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Creating...' : 'Continue to writing'}
                {!saving && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Version step */}
        {step === 'version' && createdStory && (
          <div className="space-y-6">
            <div className="border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--text-dim)]">
              Writing version for: <span className="text-[var(--text)]">{createdStory.title}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Version title</label>
              <input
                type="text"
                className="input-base"
                placeholder="The original ending / Timeline Alpha / The betrayal..."
                value={versionForm.title}
                onChange={(e) => setVersionForm({ ...versionForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Summary <span className="text-[var(--muted)]">(shown in sidebar preview)</span></label>
              <input
                type="text"
                className="input-base"
                placeholder="Brief teaser without spoilers..."
                value={versionForm.summary}
                onChange={(e) => setVersionForm({ ...versionForm, summary: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Content</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAiPanel(true)}
                    className="flex items-center gap-1 text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors"
                  >
                    <Sparkles size={11} /> AI assist
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

              {preview ? (
                <div className="preview-content story-prose min-h-64 w-full max-w-full overflow-x-hidden break-words border border-[var(--border)] bg-[var(--deep)] p-4 sm:p-6"
                  dangerouslySetInnerHTML={{ __html: versionForm.content.replace(/\n/g, '<br />') || '<em style="color:var(--muted)">Nothing to preview yet.</em>' }} />
              ) : (
                <textarea
                  className="input-base resize-none font-[Georgia,serif] text-base leading-relaxed"
                  rows={20}
                  placeholder="Begin your story here..."
                  value={versionForm.content}
                  onChange={(e) => setVersionForm({ ...versionForm, content: e.target.value })}
                />
              )}
              <p className="text-xs text-[var(--muted)] font-mono">
                {versionForm.content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>

            {/* Pricing */}
            <div className="border border-[var(--border)] p-6 space-y-4">
              <h3 className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Version access</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setVersionForm({ ...versionForm, isFree: true })}
                  className={`flex items-center gap-2 flex-1 p-3 border text-sm transition-all ${
                    versionForm.isFree ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  <Unlock size={14} /> Free to read
                </button>
                <button
                  onClick={() => setVersionForm({ ...versionForm, isFree: false })}
                  className={`flex items-center gap-2 flex-1 p-3 border text-sm transition-all ${
                    !versionForm.isFree ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10' : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  <Lock size={14} /> Paid version
                </button>
              </div>

              {!versionForm.isFree && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Price (USD)</label>
                  <input
                    type="number"
                    className="input-base w-32"
                    min="0.99"
                    max="99.99"
                    step="0.50"
                    value={versionForm.price}
                    onChange={(e) => setVersionForm({ ...versionForm, price: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-[var(--muted)]">
                    You keep ${(versionForm.price * 0.8).toFixed(2)} (80%) per purchase.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end pt-4">
              <button
                onClick={() => saveVersion(false)}
                className="btn-ghost"
                disabled={saving}
              >
                <Save size={14} /> Save & add more
              </button>
              <button
                onClick={() => saveVersion(true)}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Publishing...' : 'Save & publish'}
                {!saving && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        )}

        {!showAiPanel && (
          <button className="story-assistant-launcher" onClick={() => setShowAiPanel(true)} aria-label="Open story bot">
            <Sparkles size={17} /> <span>Bot</span>
          </button>
        )}

        {/* Floating AI story assistant */}
        {showAiPanel && (
          <div className="story-assistant-panel">
              <div className="mb-6 flex items-center gap-3">
                <Sparkles className="text-[var(--aurora)]" size={20} />
                <div><h3 className="font-display text-xl font-light text-[var(--text-bright)]">Story bot</h3><p className="text-xs text-[var(--text-dim)]">Tell me what you want to make.</p></div>
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

              {!aiResult && <div className="mb-4 flex flex-wrap gap-2">
                {['Historia', 'Misterio', 'Giro'].map((suggestion) => (
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
    </div>
  );
}

export default function WritePage() {
  return (
    <AuthProvider>
      <WriteContent />
    </AuthProvider>
  );
}
