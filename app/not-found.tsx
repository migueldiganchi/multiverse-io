import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--void)] flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--aurora)] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="relative text-center">
        <p className="font-mono text-8xl font-bold text-[var(--border-soft)] mb-4 tracking-tight">404</p>
        <h1 className="font-display text-4xl font-light text-[var(--text-bright)] mb-4">
          This universe doesn't exist
        </h1>
        <p className="text-[var(--text-dim)] mb-10">
          The page you're looking for has collapsed into another dimension.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn-primary">Return home</Link>
          <Link href="/explore" className="btn-ghost">Explore stories</Link>
        </div>
      </div>
    </div>
  );
}
