'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error);
    else setSuccess(true);
  };

  return (
    <div className="auth-page">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--aurora)] opacity-[0.05] rounded-full blur-3xl" />
      </div>

      <div className="auth-content">
        <div className="text-center mb-12">
          <Link href="/" className="auth-logo">
            MULTI<span className="text-[var(--aurora)]">VERSE</span>.io
          </Link>
        </div>

        <div className="auth-card p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={40} />
              <h2 className="font-display text-2xl font-light text-[var(--text-bright)] mb-3">Link sent</h2>
              <p className="text-sm text-[var(--text-dim)] mb-6">
                If that email is registered, you will receive a password reset link shortly.
              </p>
              <Link href="/auth/login" className="btn-ghost text-sm">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-6">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
              <h1 className="font-display text-3xl font-light text-[var(--text-bright)] mb-3">Reset password</h1>
              <p className="text-sm text-[var(--text-dim)] mb-8">
                Enter your email and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="flex items-center gap-3 bg-[var(--pulse)]/10 border border-[var(--pulse)]/30 text-[var(--pulse)] text-sm px-4 py-3 mb-6">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">Email</label>
                  <input
                    type="email"
                    className="input-base"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
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

export default function ForgotPasswordPage() {
  return (
    <AuthProvider>
      <ForgotPasswordForm />
    </AuthProvider>
  );
}
