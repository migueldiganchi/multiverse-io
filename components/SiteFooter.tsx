import BrandLogo from '@/components/BrandLogo';

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
        <BrandLogo imageClassName="h-12 w-12" />
        <span className="text-xs font-mono tracking-widest text-[var(--text-dim)]">
          MULTIVERSE.IO — INFINITE STORIES, INFINITE WORLDS
        </span>
        <span className="text-xs font-mono text-[var(--muted)]">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
