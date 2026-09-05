'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Menu, X, Sparkles, BookOpen, PenTool, User, LogOut, ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo href={undefined} imageClassName="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono text-sm tracking-widest text-[var(--text-mid)] group-hover:text-[var(--text)] transition-colors">
            MULTI<span className="text-[var(--aurora)]">VERSE</span>.io
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors flex items-center gap-2">
            <BookOpen size={14} />
            Explore
          </Link>
          {user && (
            <Link href="/write" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors flex items-center gap-2">
              <PenTool size={14} />
              Write
            </Link>
          )}
          <Link href="/pricing" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-[var(--text-mid)] hover:text-[var(--text)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--aurora-dim)] border border-[var(--aurora)] flex items-center justify-center text-xs font-mono font-bold text-[var(--aurora)]">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden md:block">{user.username}</span>
                <ChevronDown size={12} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 glass border border-[var(--border-soft)] shadow-2xl z-50">
                  <Link
                    href={`/u/${user.username}`}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-mid)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={14} /> Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-mid)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Sparkles size={14} /> Dashboard
                  </Link>
                  <div className="border-t border-[var(--border)] my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--pulse)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary text-xs py-2 px-4">
                Get started
              </Link>
            </div>
          )}

          <button
            className="md:hidden text-[var(--text-dim)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] py-4 px-6 space-y-4">
          <Link href="/explore" className="block text-sm text-[var(--text-mid)] py-2">Explore</Link>
          {user && <Link href="/write" className="block text-sm text-[var(--text-mid)] py-2">Write</Link>}
          <Link href="/pricing" className="block text-sm text-[var(--text-mid)] py-2">Pricing</Link>
          {user && <Link href="/dashboard" className="block text-sm text-[var(--text-mid)] py-2">Dashboard</Link>}
        </div>
      )}
    </nav>
  );
}
