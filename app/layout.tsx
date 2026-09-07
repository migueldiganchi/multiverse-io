import type { Metadata, Viewport } from 'next';
import { DM_Sans, Cormorant_Garamond, Space_Mono } from 'next/font/google';
import './globals.css';
import SiteFooter from '@/components/SiteFooter';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const display = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-display', weight: ['300', '400', '500', '600'] });
const mono = Space_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Multiverse.io — Infinite Stories, Infinite Worlds',
  description: 'Create stories with alternate endings. Buy and sell narrative versions. Explore infinite fictional universes.',
  applicationName: 'Multiverse.io',
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/multiverse-logo.png', type: 'image/png', sizes: '370x360' }],
    shortcut: '/multiverse-logo.png',
    apple: [{ url: '/multiverse-logo.png', type: 'image/png', sizes: '370x360' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#030305',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="antialiased">
        <div className="site-shell">
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
