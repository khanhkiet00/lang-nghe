import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nền Tảng Làng Nghề',
  description: 'Kết nối và gìn giữ di sản nghệ thuật thủ công truyền thống',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} font-sans`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body className="font-sans antialiased bg-background text-on-surface">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}