import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { ArrowRight, GitBranch, Sparkles, Lock, Zap } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[var(--void)] overflow-x-hidden">
        <Navbar />

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--aurora)] opacity-[0.06] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--gold)] opacity-[0.04] rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-[var(--aurora)] to-transparent opacity-30" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-xs font-mono tracking-widest text-[var(--aurora)] mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora)] animate-pulse" />
              INFINITE NARRATIVE ENGINE
            </div>

            <BrandLogo
              href={undefined}
              priority
              imageClassName="h-40 w-40 sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72"
              className="mx-auto mb-8 animate-float justify-center"
            />

            <h1 className="font-display text-6xl md:text-8xl font-light leading-[0.95] mb-8 animate-fade-in-delay-1">
              <span className="text-[var(--text-bright)]">Every story</span>
              <br />
              <span className="gradient-text italic">branches infinite</span>
            </h1>

            <p className="text-lg text-[var(--text-dim)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-delay-2 font-light">
              Write stories with alternate endings. Sell the paths untaken.
              Readers explore every version of your universe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-3">
              <Link href="/auth/register" className="btn-primary">
                Start writing free
                <ArrowRight size={16} />
              </Link>
              <Link href="/explore" className="btn-ghost">
                Explore stories
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-delay-3">
              {[
                { n: '∞', label: 'Alternate endings' },
                { n: '80%', label: 'Revenue to writers' },
                { n: '0', label: 'Ads, ever' },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-3xl text-[var(--text-bright)] mb-1">{n}</div>
                  <div className="text-xs text-[var(--text-dim)] font-mono tracking-wider">{label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-xs font-mono tracking-widest text-[var(--aurora)] mb-4">THE MODEL</p>
              <h2 className="font-display text-5xl font-light text-[var(--text-bright)]">Stories as multiverses</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-[var(--border)]">
              {[
                {
                  icon: <GitBranch size={24} />,
                  title: 'Branch narratives',
                  desc: 'Every story can have infinite versions. What if the hero made a different choice? Write it. Each branch lives as a separate, purchasable version.',
                  color: 'var(--aurora)',
                },
                {
                  icon: <Lock size={24} />,
                  title: 'Gate your endings',
                  desc: 'Some versions are free. Some cost $1.99. You decide what to give and what to sell. Build anticipation, then monetize the revelation.',
                  color: 'var(--gold)',
                },
                {
                  icon: <Sparkles size={24} />,
                  title: 'AI co-writes with you',
                  desc: 'Gemini AI helps you generate alternate storylines, fill in plot gaps, and explore narrative branches you had not imagined. Your voice, amplified.',
                  color: 'var(--cyan)',
                },
              ].map((item) => (
                <div key={item.title} className="bg-[var(--deep)] p-10">
                  <div style={{ color: item.color }} className="mb-6">{item.icon}</div>
                  <h3 className="font-display text-2xl font-light text-[var(--text-bright)] mb-4">{item.title}</h3>
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 px-6 bg-[var(--deep)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-mono tracking-widest text-[var(--gold)] mb-4">PLANS</p>
              <h2 className="font-display text-5xl font-light text-[var(--text-bright)] mb-4">Read free. Write to earn.</h2>
              <p className="text-[var(--text-dim)]">No hidden fees. 80% of every sale goes directly to the writer.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Explorer',
                  price: 'Free',
                  per: '',
                  features: ['Read all free versions', 'Follow writers', 'Basic library'],
                  cta: 'Start free',
                  accent: 'var(--muted)',
                  featured: false,
                },
                {
                  name: 'Reader',
                  price: '$4.99',
                  per: '/mo',
                  features: ['Everything in Free', 'Unlimited paid versions', 'Priority support'],
                  cta: 'Subscribe',
                  accent: 'var(--aurora)',
                  featured: true,
                },
                {
                  name: 'Writer',
                  price: '$9.99',
                  per: '/mo',
                  features: ['Everything in Reader', 'Unlimited stories', 'AI co-writer', 'Sell versions', '80% revenue share'],
                  cta: 'Start writing',
                  accent: 'var(--gold)',
                  featured: false,
                },
              ].map((plan) => (
                <div key={plan.name} className={`relative flex h-full flex-col border p-8 pt-9 ${plan.featured ? 'border-[var(--aurora)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--void)]'}`}>
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-[var(--color-aurora)] px-4 py-1 text-[10px] font-mono tracking-widest text-white">MOST POPULAR</div>
                  )}
                  <p className="text-xs font-mono tracking-widest mb-2" style={{ color: plan.accent }}>{plan.name.toUpperCase()}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display text-4xl font-light text-[var(--text-bright)]">{plan.price}</span>
                    <span className="text-sm text-[var(--text-dim)]">{plan.per}</span>
                  </div>
                  <ul className="my-6 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-mid)]">
                        <div className="w-1 h-1 rounded-full" style={{ background: plan.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className={`mt-auto block text-center py-3 text-sm font-mono tracking-wider transition-all ${plan.featured ? 'bg-[var(--aurora)] text-white hover:bg-[#7d75ff]' : 'border border-[var(--border-soft)] text-[var(--text-mid)] hover:border-[var(--aurora)]'}`}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--aurora)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
          <div className="max-w-2xl mx-auto text-center">
            <Zap className="mx-auto mb-6 text-[var(--gold)]" size={32} />
            <h2 className="font-display text-5xl font-light text-[var(--text-bright)] mb-6">Your universe is waiting</h2>
            <p className="text-[var(--text-dim)] mb-10">Join thousands of writers building infinite story worlds. Every path is a new revenue stream.</p>
            <Link href="/auth/register" className="btn-gold">Create your first story</Link>
          </div>
        </section>

      </div>
    </AuthProvider>
  );
}
