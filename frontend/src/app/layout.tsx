import { Manrope } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const manrope = Manrope({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nền Tảng Làng Nghề',
  description: 'Kết nối và gìn giữ di sản nghệ thuật thủ công truyền thống',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${manrope.variable} font-manrope`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className="font-manrope antialiased bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}