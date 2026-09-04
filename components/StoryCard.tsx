import Link from 'next/link';
import { BookOpen, GitBranch, Lock, Unlock, Eye } from 'lucide-react';

interface StoryCardProps {
  story: {
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
  };
}

const GENRE_COLORS: Record<string, string> = {
  'Sci-Fi': 'text-[var(--cyan)] border-[var(--cyan)]',
  'Fantasy': 'text-[var(--gold)] border-[var(--gold)]',
  'Horror': 'text-[var(--pulse)] border-[var(--pulse)]',
  'Romance': 'text-pink-400 border-pink-400',
  'Mystery': 'text-purple-400 border-purple-400',
  'Thriller': 'text-orange-400 border-orange-400',
};

export default function StoryCard({ story }: StoryCardProps) {
  const primaryGenre = story.genre[0] || 'Fiction';
  const genreColor = GENRE_COLORS[primaryGenre] || 'text-[var(--aurora)] border-[var(--aurora)]';

  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <article className="border border-[var(--border)] bg-[var(--deep)] hover:border-[var(--aurora-dim)] hover:bg-[var(--surface)] transition-all duration-300 p-6 relative overflow-hidden">
        {/* Subtle hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--aurora)] to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />

        {/* Genre tag */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-mono tracking-widest border px-2 py-1 ${genreColor} opacity-70`}>
            {primaryGenre.toUpperCase()}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--text-dim)]">
            <Eye size={11} />
            {story.totalViews.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-light text-[var(--text-bright)] mb-3 leading-snug group-hover:text-white transition-colors line-clamp-2">
          {story.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-5 line-clamp-3">
          {story.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)] font-mono">
            @{story.authorUsername}
          </span>

          <div className="flex items-center gap-3 text-xs text-[var(--text-dim)]">
            {story.totalVersions > 0 && (
              <span className="flex items-center gap-1">
                <GitBranch size={11} />
                {story.totalVersions}
              </span>
            )}
            {story.freeVersions > 0 && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Unlock size={11} />
                {story.freeVersions}
              </span>
            )}
            {story.paidVersions > 0 && (
              <span className="flex items-center gap-1 text-[var(--gold)]">
                <Lock size={11} />
                {story.paidVersions}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {story.readingTime}m
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
