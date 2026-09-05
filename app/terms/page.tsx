import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export const metadata = {
  title: 'Terms of Use — Multiverse.io',
  description: 'The terms that govern use of Multiverse.io.',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-content">
        <BrandLogo href="/" imageClassName="h-20 w-20" className="mx-auto mb-8 justify-center" priority />
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">The rules of this universe</p>
        <h1 className="mb-4 text-center font-display text-5xl font-light text-[var(--text-bright)]">Terms of Use</h1>
        <p className="mb-12 text-center text-sm text-[var(--text-dim)]">Last updated: September 5, 2026</p>

        <article className="auth-card legal-card">
          <section><h2>1. Using Multiverse.io</h2><p>Multiverse.io is a platform for discovering, creating, and sharing branching stories. By using the service, you agree to use it lawfully and respect other members of the community.</p></section>
          <section><h2>2. Accounts</h2><p>You are responsible for keeping your account credentials secure and for activity performed through your account. You must provide accurate information and be at least old enough to enter into this agreement in your jurisdiction.</p></section>
          <section><h2>3. Your content</h2><p>You retain ownership of stories and other content you submit. You grant Multiverse.io the limited license needed to host, display, distribute, and improve the service. Do not upload content that infringes rights, violates the law, or harms other users.</p></section>
          <section><h2>4. Purchases and creator earnings</h2><p>Prices and access conditions are shown before purchase. Creator revenue shares and payment timing are described in the applicable product or plan details. You are responsible for taxes and information required to receive payments.</p></section>
          <section><h2>5. Changes and termination</h2><p>We may update the service or these terms when necessary. We may suspend accounts that abuse the platform or violate these terms. You may stop using the service at any time.</p></section>
          <section><h2>6. Contact</h2><p>Questions about these terms can be sent through the contact information provided in the application.</p></section>
          <Link href="/" className="btn-ghost mt-4 w-fit">Return home</Link>
        </article>
      </div>
    </main>
  );
}
