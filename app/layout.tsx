import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Kin — AI Website Monitoring',
  description: 'Add a URL. Kin tells you when it matters. AI-powered website change monitoring with a penguin companion.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
