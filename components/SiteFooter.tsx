import BrandLogo from '@/components/BrandLogo';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
        <BrandLogo href="/" imageClassName="h-12 w-12" />
        <span className="text-xs font-mono tracking-widest text-[var(--text-dim)]">
          MULTIVERSE.IO — INFINITE STORIES, INFINITE WORLDS
        </span>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)]">
          <Link href="/terms" className="transition-colors hover:text-[var(--text)]">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-[var(--text)]">Privacy</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
