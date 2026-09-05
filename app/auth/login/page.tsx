'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PasswordInput from '@/components/PasswordInput';
import { AuthProvider } from '@/contexts/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/explore');
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--aurora)] opacity-[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-[var(--gold)] opacity-[0.04] rounded-full blur-3xl" />
      </div>

      <div className="auth-content">
        {/* Logo */}
        <div className="text-center mb-9">
          <BrandLogo imageClassName="h-24 w-24" className="mx-auto justify-center" priority />
          <p className="text-[var(--text-dim)] mt-3">Welcome back to your universe</p>
        </div>

        <div className="auth-card p-8">
          <h1 className="font-display text-3xl font-light text-[var(--text-bright)] mb-8">Sign in</h1>

          {error && (
            <div className="flex items-center gap-3 bg-[var(--pulse)]/10 border border-[var(--pulse)]/30 text-[var(--pulse)] text-sm px-4 py-3 mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">
                Email
              </label>
              <input
                type="email"
                className="input-base"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-[var(--aurora)] hover:text-[var(--text)] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[var(--text-dim)]">
          No account yet?{' '}
          <Link href="/auth/register" className="text-[var(--aurora)] hover:text-[var(--text)] transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
