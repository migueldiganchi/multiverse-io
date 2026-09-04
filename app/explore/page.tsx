'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StoryCard from '@/components/StoryCard';
import { Search, Filter, Loader2 } from 'lucide-react';

const GENRES = ['All', 'Sci-Fi', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Thriller', 'Literary Fiction'];

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

function ExploreContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (genre !== 'All') params.set('genre', genre);
    if (search) params.set('search', search);

    const res = await fetch(`/api/stories?${params}`);
    if (res.ok) {
      const data = await res.json();
      setStories(data.stories);
      setTotalPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, genre, search]);

  useEffect(() => {
    const t = setTimeout(fetchStories, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStories, search]);

  return (
    <div className="min-h-screen bg-[var(--void)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono tracking-widest text-[var(--aurora)] mb-3">LIBRARY</p>
          <h1 className="font-display text-5xl font-light text-[var(--text-bright)] mb-2">Explore universes</h1>
          <p className="text-[var(--text-dim)]">Every story is a world with infinite possible endings.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input
              type="text"
              className="input-base pl-11"
              placeholder="Search stories, authors, themes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => { setGenre(g); setPage(1); }}
                className={`whitespace-nowrap px-4 py-2 text-xs font-mono tracking-wider border transition-all ${
                  genre === g
                    ? 'border-[var(--aurora)] text-[var(--aurora)] bg-[var(--aurora)]/10'
                    : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-soft)] hover:text-[var(--text)]'
                }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stories grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="text-[var(--aurora)] animate-spin" size={32} />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display text-3xl text-[var(--text-dim)] mb-4">No stories found</p>
            <p className="text-sm text-[var(--muted)]">Be the first to write in this space.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 text-sm font-mono border transition-all ${
                  page === p
                    ? 'border-[var(--aurora)] text-[var(--aurora)] bg-[var(--aurora)]/10'
                    : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--aurora)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <AuthProvider>
      <ExploreContent />
    </AuthProvider>
  );
}
