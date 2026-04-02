'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function RegisterArtisanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    description: '',
    expertise: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('langnghe_access_token');
    if (!token) {
      router.push('/auth');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  async function handleRefreshTokens() {
    const refreshToken = localStorage.getItem('langnghe_refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      
      const data = await res.json();
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('langnghe_access_token', data.accessToken);
        localStorage.setItem('langnghe_refresh_token', data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('langnghe_access_token');
    
    try {
      const res = await fetch(`${API_BASE}/artisans/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        setError(`Lỗi: ${data.message || 'Không thể đăng ký lúc này'}`);
        setLoading(false);
        return;
      }

      // Đăng ký thành công -> Refesh Token ngầm
      const refreshed = await handleRefreshTokens();
      if (refreshed) {
        // Chuyển về trang dashboard
        router.push('/dashboard');
      } else {
        // Fallback nếu refresh hỏng
        setError('Đăng ký thành công nhưng không thể tự động cập nhật quyền. Vui lòng đăng xuất và đăng nhập lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      if (!error) setLoading(false);
    }
  }

  if (checkingAuth) return null;

  return (
    <main className="min-h-screen bg-[#F9F9F7] text-[#1A1C1C]">
      <nav className="border-b border-[#C84B31]/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-[#C84B31]">
            ← Quay lại Dashboard
          </Link>
          <span className="font-bold text-[#C84B31]">Đăng Ký Xưởng Mới</span>
        </div>
      </nav>

      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Trở Thành Nghệ Nhân</h1>
          <p className="mt-2 text-lg text-zinc-500">
            Hãy cho chúng tôi biết về bạn và những tác phẩm bạn tạo ra.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Nghệ Danh / Tên Xưởng *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
              placeholder="VD: Gốm Sứ Minh Đức"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Lĩnh Vực Chuyên Môn</label>
            <input
              type="text"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
              placeholder="VD: Gốm Men Lam truyền thống"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Khu Vực Làm Việc / Tên Làng</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
              placeholder="VD: Làng Gốm Bát Tràng, Hà Nội"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Giới Thiệu Câu Chuyện Của Bạn</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all resize-none"
              placeholder="Chia sẻ về đam mê và chặng đường nghề của bạn..."
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#C84B31] py-4 font-bold text-white transition-all hover:bg-[#9f3d28] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang Thiết Lập...' : 'Bắt Đầu Cơ Nghiệp'}
          </button>
        </form>
      </section>
    </main>
  );
}
