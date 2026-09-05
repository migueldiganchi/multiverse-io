'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';
import { AuthProvider } from '@/contexts/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.push('/auth/forgot-password');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setErrors({ form: data.error });
    else setSuccess(true);
  };

  return (
    <div className="auth-page">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--aurora)] opacity-[0.05] rounded-full blur-3xl" />

      <div className="auth-content">
        <div className="text-center mb-12">
          <BrandLogo href="/" imageClassName="h-24 w-24" className="mx-auto justify-center" priority />
        </div>

        <div className="auth-card p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={40} />
              <h2 className="font-display text-2xl font-light text-[var(--text-bright)] mb-3">Password updated</h2>
              <p className="text-sm text-[var(--text-dim)] mb-6">Your password has been reset successfully.</p>
              <Link href="/auth/login" className="btn-primary">Sign in now <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-light text-[var(--text-bright)] mb-3">New password</h1>
              <p className="text-sm text-[var(--text-dim)] mb-8">Choose a new password for your account.</p>

              {errors.form && (
                <div className="flex items-center gap-3 bg-[var(--pulse)]/10 border border-[var(--pulse)]/30 text-[var(--pulse)] text-sm px-4 py-3 mb-6">
                  <AlertCircle size={16} />
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <PasswordInput
                  label="New password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: (e.target as HTMLInputElement).value })}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Repeat your new password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: (e.target as HTMLInputElement).value })}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
                <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                  {loading ? 'Updating...' : 'Update password'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[var(--void)]" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthProvider>
  );
}
