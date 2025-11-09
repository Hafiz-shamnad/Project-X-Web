// ===================================
// app/layout.tsx
// ===================================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project X - CTF Platform',
  description: 'Capture The Flag hacking challenges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  );
}