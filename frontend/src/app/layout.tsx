import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

// 1. Cấu hình font Be Vietnam Pro với bộ gõ tiếng Việt
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nền Tảng Làng Nghề',
  description: 'Kết nối và gìn giữ di sản nghệ thuật thủ công truyền thống',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 2. Chèn biến font vào thẻ html, xóa class "dark" không cần thiết
    <html lang="vi" className={`${beVietnamPro.variable}`}>
      {/* 3. Xóa màu nền đen tĩnh và font-inter cũ, dùng font-sans để nhận cấu hình Tailwind */}
      <body className="font-sans antialiased text-[#1A1C1C] bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}