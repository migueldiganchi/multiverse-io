'use client';

import { useState } from 'react';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { AuthProvider } from '@/contexts/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function RegisterForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', displayName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error ?? 'Unable to create your account.' });
      } else {
        setSuccess(true);
      }
    } catch {
      setErrors({ form: 'The universe is unreachable right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', '#ff6b9d', '#f59e0b', '#c8a96e', '#6c63ff', '#4dd9e0'][strength];

  if (success) {
    return (
      <div className="auth-page">
        <div className="starfield absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[var(--color-aurora)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
        <div className="auth-content">
          <BrandLogo href="/" imageClassName="h-24 w-24" className="mx-auto mb-8 justify-center" priority />
          <div className="auth-card p-10 text-center sm:p-14">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 shadow-[0_0_40px_rgba(200,169,110,0.2)]">
              <CheckCircle2 className="text-[var(--color-gold)]" size={36} />
            </div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--color-gold)]">Portal unlocked</p>
            <h1 className="mb-4 font-display text-5xl font-light text-[var(--color-text-bright)]">Your universe awaits</h1>
            <p className="mb-8 text-[var(--color-text-dim)]">
              We sent an activation link to <strong className="text-[var(--color-text)]">{form.email}</strong>.
              Click it to activate your account and enter your universe.
            </p>
            <Link href="/auth/login" className="btn-ghost rounded-full px-7">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="starfield absolute inset-0 opacity-90" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-[var(--color-aurora)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-[var(--color-pulse)]/10 blur-3xl" />

      <div className="auth-content max-w-md text-center">
        <BrandLogo href="/" imageClassName="h-24 w-24" className="mx-auto mb-8 justify-center" priority />
        <div className="mb-9">
          <p className="mx-auto max-w-md text-base leading-7 text-[var(--color-text-dim)]">
            Step beyond the familiar. Build branching tales, discover impossible worlds, and leave a little magic behind.
          </p>
        </div>

        <div className="w-full">
          <div className="auth-card rounded-[1.5rem] p-7 text-left sm:p-9">
            <div className="mb-8">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)]">Begin your journey</p>
              <h2 className="font-display text-4xl font-light text-[var(--color-text-bright)]">Create account</h2>
            </div>

          {errors.form && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--color-pulse)]/30 bg-[var(--color-pulse)]/10 px-4 py-3 text-sm text-[var(--color-pulse)]">
              <AlertCircle size={16} />
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-text-dim)]">Username</label>
              <input
                type="text"
                className={`input-base rounded-xl ${errors.username ? 'border-[var(--color-pulse)]' : ''}`}
                placeholder="your_username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-[var(--color-pulse)]">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-text-dim)]">Display name <span className="text-[var(--color-muted)]">(optional)</span></label>
              <input
                type="text"
                className="input-base rounded-xl"
                placeholder="How your name appears publicly"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-text-dim)]">Email</label>
              <input
                type="email"
                className={`input-base rounded-xl ${errors.email ? 'border-[var(--color-pulse)]' : ''}`}
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-[var(--color-pulse)]">{errors.email}</p>}
            </div>

            <div>
              <PasswordInput
                label="Password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
                error={errors.password}
                autoComplete="new-password"
              />
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor : 'var(--border-soft)' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            <PasswordInput
              label="Confirm password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: (e.target as HTMLInputElement).value })}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button type="submit" className="btn-primary mt-2 w-full justify-center rounded-xl" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-text-dim)]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[var(--color-aurora)] transition-colors hover:text-[var(--color-text)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
