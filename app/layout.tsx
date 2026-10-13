import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B5D3B',
};

export const metadata: Metadata = {
  title: 'Benapole Special - Restaurant Ordering & Customizer',
  description: 'Mobile-first ordering platform and visual website customizer for Benapole Special restaurant in Bangladesh with bilingual Bengali/English support, live order tracking, and full admin suite.',
  openGraph: {
    title: 'Benapole Special - Restaurant Ordering & Customizer',
    description: 'Mobile-first ordering platform and visual website customizer for Benapole Special restaurant in Bangladesh with bilingual Bengali/English support, live order tracking, and full admin suite.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Benapole Special - Restaurant Ordering & Customizer',
    description: 'Mobile-first ordering platform and visual website customizer for Benapole Special restaurant in Bangladesh with bilingual Bengali/English support, live order tracking, and full admin suite.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-[#FFFDF7] text-stone-900">{children}</body>
    </html>
  );
}
