import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Explorer',
    price: 'Free',
    per: '',
    tagline: 'Start your journey through infinite worlds.',
    features: [
      'Read all free story versions',
      'Follow your favourite writers',
      'Personal reading library',
      'Browse full story catalog',
    ],
    notIncluded: [
      'Locked story versions',
      'Write & publish stories',
      'AI writing assistant',
      'Sell story versions',
    ],
    cta: 'Start free',
    href: '/auth/register',
    accent: 'var(--muted)',
  },
  {
    name: 'Reader',
    price: '$4.99',
    per: '/month',
    tagline: 'Unlock every alternate ending ever written.',
    features: [
      'Everything in Explorer',
      'Unlimited access to paid versions',
      'Advance reading mode',
      'Priority email support',
      'Early access to new stories',
    ],
    notIncluded: [
      'Write & publish stories',
      'AI writing assistant',
      'Sell story versions',
    ],
    cta: 'Subscribe as Reader',
    href: '/auth/register',
    accent: 'var(--aurora)',
    featured: true,
  },
  {
    name: 'Writer',
    price: '$9.99',
    per: '/month',
    tagline: 'Build universes. Sell realities. Earn from your craft.',
    features: [
      'Everything in Reader',
      'Unlimited story creation',
      'Unlimited versions per story',
      'Gemini AI co-writer',
      'Sell paid versions',
      '80% revenue share',
      'Analytics dashboard',
      'Writer profile page',
      'Priority listing in explore',
    ],
    notIncluded: [],
    cta: 'Start Writing',
    href: '/auth/register',
    accent: 'var(--gold)',
  },
];

export default function PricingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[var(--void)]">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-xs font-mono tracking-widest text-[var(--gold)] mb-4">PRICING</p>
            <h1 className="font-display text-6xl font-light text-[var(--text-bright)] mb-4">
              Simple, honest pricing
            </h1>
            <p className="text-lg text-[var(--text-dim)] max-w-xl mx-auto">
              No hidden fees. Writers keep 80% of every sale.
              The platform makes money only when you do.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex h-full flex-col border p-8 pt-9 ${
                  plan.featured
                    ? 'border-[var(--aurora)] bg-[var(--surface)]'
                    : 'border-[var(--border)] bg-[var(--deep)]'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-[var(--color-aurora)] px-4 py-1 text-[10px] font-mono tracking-widest text-white">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-xs font-mono tracking-widest mb-3" style={{ color: plan.accent }}>
                    {plan.name.toUpperCase()}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-display text-5xl font-light text-[var(--text-bright)]">{plan.price}</span>
                    {plan.per && <span className="text-[var(--text-dim)]">{plan.per}</span>}
                  </div>
                  <p className="text-sm text-[var(--text-dim)]">{plan.tagline}</p>
                </div>

                <div className="mb-8 flex-1 space-y-6">
                  <div>
                    <p className="text-xs font-mono text-[var(--text-dim)] tracking-wider mb-3">INCLUDED</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-mid)]">
                          <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div>
                      <p className="text-xs font-mono text-[var(--muted)] tracking-wider mb-3">NOT INCLUDED</p>
                      <ul className="space-y-2.5">
                        {plan.notIncluded.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted)] line-through decoration-[var(--border)]">
                            <span className="w-3.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-auto block text-center py-3.5 text-sm font-mono tracking-wider transition-all ${
                    plan.featured
                      ? 'bg-[var(--aurora)] text-white hover:bg-[#7d75ff]'
                      : plan.name === 'Writer'
                      ? 'bg-[var(--gold)] text-[var(--void)] hover:bg-[#d4b87e]'
                      : 'border border-[var(--border-soft)] text-[var(--text-mid)] hover:border-[var(--aurora)] hover:text-[var(--text)]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Revenue model explainer */}
          <div className="border border-[var(--border)] bg-[var(--deep)] p-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-[var(--gold)]" size={20} />
              <h2 className="font-display text-2xl font-light text-[var(--text-bright)]">The writer economy</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-[var(--text-dim)]">
              <div>
                <p className="text-[var(--gold)] font-mono text-sm mb-2">PER-SALE MODEL</p>
                <p>Writers set their own prices. When a reader buys a version, the writer keeps 80% and the platform keeps 20%. No monthly caps.</p>
              </div>
              <div>
                <p className="text-[var(--aurora)] font-mono text-sm mb-2">SUBSCRIPTION MODEL</p>
                <p>Reader subscribers get unlimited access to all paid content. Revenue is pooled and distributed to writers based on readership share.</p>
              </div>
              <div>
                <p className="text-[var(--cyan)] font-mono text-sm mb-2">MIXED MONETIZATION</p>
                <p>Writers can have some free versions (for discovery) and some paid versions (for revenue). You decide the balance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
