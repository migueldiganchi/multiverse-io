'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function ActivateContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid activation link');
      return;
    }

    fetch('/api/auth/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Activation failed');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--void)] flex items-center justify-center px-6 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[var(--aurora)] opacity-[0.05] rounded-full blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="inline-block font-mono text-lg tracking-widest text-[var(--text-mid)] hover:text-[var(--text)] transition-colors mb-16">
          MULTI<span className="text-[var(--aurora)]">VERSE</span>.io
        </Link>

        {status === 'loading' && (
          <div>
            <Loader2 className="mx-auto mb-4 text-[var(--aurora)] animate-spin" size={40} />
            <p className="text-[var(--text-dim)]">Activating your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="border border-[var(--border)] bg-[var(--deep)] p-10">
            <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
            <h1 className="font-display text-4xl font-light text-[var(--text-bright)] mb-4">Universe unlocked</h1>
            <p className="text-[var(--text-dim)] mb-8">{message}</p>
            <Link href="/auth/login" className="btn-primary">
              Enter your universe
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="border border-[var(--border)] bg-[var(--deep)] p-10">
            <XCircle className="mx-auto mb-4 text-[var(--pulse)]" size={48} />
            <h1 className="font-display text-3xl font-light text-[var(--text-bright)] mb-4">Activation failed</h1>
            <p className="text-[var(--text-dim)] mb-8">{message}</p>
            <Link href="/auth/register" className="btn-ghost">
              Create a new account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[var(--void)]" />}>
        <ActivateContent />
      </Suspense>
    </AuthProvider>
  );
}
