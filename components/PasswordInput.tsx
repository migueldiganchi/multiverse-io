'use client';

import { useState, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-mono tracking-widest text-[var(--text-dim)] uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`input-base pr-12 ${error ? 'border-[var(--pulse)]' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text-mid)] transition-colors focus:outline-none"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-[var(--pulse)]">{error}</p>}
    </div>
  );
}
