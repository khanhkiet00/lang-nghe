import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Làng Nghề',
  description: 'Nền tảng làng nghề',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
