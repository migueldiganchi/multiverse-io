import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export const metadata = {
  title: 'Privacy Policy — Multiverse.io',
  description: 'How Multiverse.io handles information and privacy.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-content">
        <BrandLogo href="/" imageClassName="h-20 w-20" className="mx-auto mb-8 justify-center" priority />
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--cyan)]">Your data, your dimension</p>
        <h1 className="mb-4 text-center font-display text-5xl font-light text-[var(--text-bright)]">Privacy Policy</h1>
        <p className="mb-12 text-center text-sm text-[var(--text-dim)]">Last updated: September 5, 2026</p>

        <article className="auth-card legal-card">
          <section><h2>1. Information we collect</h2><p>We collect information you provide when creating an account, publishing stories, contacting us, or making a purchase. We also receive technical information needed to keep the service secure and reliable.</p></section>
          <section><h2>2. How we use information</h2><p>We use information to provide account features, authenticate users, process transactions, deliver messages, personalize the experience, and detect abuse. We do not sell personal information.</p></section>
          <section><h2>3. Content and public profiles</h2><p>Stories, usernames, display names, and other profile details you choose to publish may be visible to other users. Avoid including personal information you do not want to make public.</p></section>
          <section><h2>4. Service providers</h2><p>We may use trusted providers for hosting, databases, email, analytics, payments, and security. They receive only the information needed to perform their services and must handle it appropriately.</p></section>
          <section><h2>5. Your choices</h2><p>You may request access, correction, or deletion of personal information, subject to legal and operational requirements. You can also stop receiving optional communications through the available account controls.</p></section>
          <section><h2>6. Updates</h2><p>We may update this policy as the service evolves. The current version will always be available on this page.</p></section>
          <Link href="/" className="btn-ghost mt-4 w-fit">Return home</Link>
        </article>
      </div>
    </main>
  );
}
