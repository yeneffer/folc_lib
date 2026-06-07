import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FolcLib',
  description: 'NestJS + Next.js + Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
