import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Làng Nghề',
  description: 'Nền tảng làng nghề',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#09090B] text-zinc-100 font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
