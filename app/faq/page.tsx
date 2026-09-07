'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, X } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: 'Getting started',
    question: 'What is Multiverse.io?',
    answer: 'Multiverse.io is a platform for creating, discovering, and sharing branching stories. Each version can open a different path through the same universe.',
  },
  {
    category: 'Getting started',
    question: 'How do I create an account?',
    answer: 'Choose Get started or Create account, enter your username, email, and password, then activate your account from the link sent to your inbox.',
  },
  {
    category: 'Reading',
    question: 'Can I read stories for free?',
    answer: 'Yes. The Explorer plan includes access to all free story versions and the full story catalog. Some alternate endings may require a purchase or subscription.',
  },
  {
    category: 'Reading',
    question: 'What are story versions?',
    answer: 'Versions are alternate branches of a story. A writer can explore different choices, endings, and realities without losing the original narrative.',
  },
  {
    category: 'Writing',
    question: 'How do I publish a story?',
    answer: 'Create a story from the Write area, add its first version, and publish it when you are ready. You can continue adding branches and alternate endings afterward.',
  },
  {
    category: 'Writing',
    question: 'Can I use AI while writing?',
    answer: 'Writer plans include the Gemini-powered co-writer, which can help explore plot branches, fill gaps, and develop ideas while keeping your creative direction in control.',
  },
  {
    category: 'Payments',
    question: 'How do writers earn money?',
    answer: 'Writers can sell selected story versions. The platform shares 80% of each sale with the writer, subject to the applicable payment and tax requirements.',
  },
  {
    category: 'Payments',
    question: 'What subscription plans are available?',
    answer: 'Explorer is free, Reader unlocks paid versions through a monthly subscription, and Writer adds publishing, AI co-writing, sales, analytics, and creator tools.',
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'From the sign-in page, choose Forgot password and enter your email. We will send a secure link to create a new password.',
  },
  {
    category: 'Account',
    question: 'How can I contact support?',
    answer: 'If you need help with your account, content, or a purchase, use the support contact provided by the application team.',
  },
];

export default function FaqPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return faqItems;
    return faqItems.filter((item) =>
      `${item.question} ${item.answer}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const groupedItems = useMemo(
    () =>
      filteredItems.reduce<Record<string, FaqItem[]>>((groups, item) => {
        (groups[item.category] ??= []).push(item);
        return groups;
      }, {}),
    [filteredItems],
  );

  return (
    <main className="legal-page">
      <div className="legal-content max-w-4xl text-center">
        <BrandLogo href="/" imageClassName="h-20 w-20" className="mx-auto mb-8 justify-center" priority />
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--aurora)]">Navigate the unknown</p>
        <h1 className="mb-4 text-center font-display text-5xl font-light text-[var(--text-bright)]">Frequently asked questions</h1>
        <p className="mx-auto mb-10 max-w-xl text-center leading-7 text-[var(--text-dim)]">
          Find your way through the Multiverse. Search every question and answer, or explore the topics below.
        </p>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="glass mx-auto mb-12 flex w-full max-w-xl items-center gap-3 rounded-full px-5 py-4 text-left text-sm text-[var(--text-dim)] transition-all hover:border-[var(--aurora)] hover:text-[var(--text)]"
        >
          <Search size={17} className="text-[var(--aurora)]" />
          <span>Search questions and answers...</span>
          <span className="ml-auto hidden rounded border border-[var(--border-soft)] px-2 py-1 font-mono text-[10px] text-[var(--muted)] sm:block">SEARCH</span>
        </button>

        <div className="space-y-10">
          {Object.entries(groupedItems).map(([category, items]) => (
            <section key={category}>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">{category}</p>
              <div className="auth-card overflow-hidden">
                {items.map((item) => {
                  const isOpen = openQuestion === item.question;
                  return (
                    <div key={item.question} className="border-b border-[var(--border)] last:border-b-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[var(--text-bright)] transition-colors hover:bg-[var(--surface)]"
                      >
                        <span className="font-display text-xl font-light">{item.question}</span>
                        <ChevronDown size={18} className={`flex-shrink-0 text-[var(--aurora)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && <p className="px-6 pb-6 text-left leading-7 text-[var(--text-dim)]">{item.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="auth-card px-6 py-14 text-center">
            <Search className="mx-auto mb-4 text-[var(--muted)]" size={28} />
            <h2 className="font-display text-2xl text-[var(--text-bright)]">No answers found</h2>
            <p className="mt-2 text-sm text-[var(--text-dim)]">Try another word or search for a broader topic.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="btn-ghost">Return home</Link>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--void)]/75 px-4 pt-[12vh] backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Search frequently asked questions">
          <div className="auth-card w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(108,99,255,0.24)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
              <Search size={19} className="text-[var(--aurora)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by question or answer..."
                className="search-field min-w-0 flex-1 bg-transparent text-[var(--text-bright)] outline-none placeholder:text-[var(--muted)]"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-[var(--text-dim)] transition-colors hover:text-[var(--text-bright)]">
                <X size={19} />
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-3">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => { setOpenQuestion(item.question); setSearchOpen(false); }}
                  className="w-full rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--surface)]"
                >
                  <p className="text-sm text-[var(--text-bright)]">{item.question}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-dim)]">{item.answer}</p>
                </button>
              )) : (
                <p className="px-4 py-8 text-center text-sm text-[var(--text-dim)]">No matching questions.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
