'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '@/lib/images';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type ArtisanProfile = {
  fullName: string;
  slug: string;
  description?: string | null;
  expertise?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  cccdUrl?: string | null;
  isVerified?: boolean;
  user?: {
    phone?: string | null;
  };
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    expertise: '',
    location: '',
    description: '',
    avatarUrl: '',
    cccdUrl: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('langnghe_access_token');
      try {
        const res = await fetch(`${API_BASE}/artisans/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load artisan profile');
        }

        const data = (await res.json()) as ArtisanProfile;
        setFormData({
          fullName: data.fullName || '',
          phone: data.user?.phone || '',
          expertise: data.expertise || '',
          location: data.location || '',
          description: data.description || '',
          avatarUrl: data.avatarUrl || '',
          cccdUrl: data.cccdUrl || '',
        });
      } catch {
        toast.error('Không thể tải thông tin cửa hàng');
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem('langnghe_access_token');
    const uploadData = new FormData();
    uploadData.append('files', file);
    uploadData.append('folderType', 'artisans');

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, avatarUrl: data.urls?.[0] || '' }));
      toast.success('Đã tải ảnh cửa hàng lên Cloudinary');
    } catch {
      toast.error('Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('langnghe_access_token');

    try {
      const res = await fetch(`${API_BASE}/artisans/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        throw new Error(message || 'Không thể lưu cài đặt');
      }

      toast.success('Đã cập nhật thông tin cửa hàng');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8 md:p-12">
        <div className="flex min-h-[360px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C84B31] border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 md:p-12">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C84B31]">
          Hồ sơ xưởng
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#1A1C1C] md:text-5xl">
          Cài Đặt Cửa Hàng
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-6 text-[#58413C]">
          Cập nhật thông tin hiển thị công khai cho người mua: tên xưởng, câu chuyện,
          chuyên môn, địa chỉ và ảnh đại diện.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="mb-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Ảnh nhận diện
            </p>
            <div className="mx-auto h-44 w-44 overflow-hidden rounded-3xl border-4 border-[#F5F2EE] bg-zinc-100 shadow-inner">
              {formData.avatarUrl ? (
                <img
                  src={resolveImageUrl(formData.avatarUrl)}
                  alt={formData.fullName || 'Ảnh cửa hàng'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-black text-[#C84B31]/30">
                  {(formData.fullName || 'L').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1A1C1C] px-4 py-4 text-sm font-bold text-white transition-all hover:bg-[#C84B31]">
              <span className="material-symbols-outlined text-lg">
                {uploading ? 'sync' : 'add_a_photo'}
              </span>
              {uploading ? 'Đang tải ảnh...' : 'Thay ảnh cửa hàng'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleAvatarUpload}
              />
            </label>

            <div className="mt-6 rounded-xl bg-[#F9F9F7] p-4 text-xs font-medium leading-5 text-[#58413C]">
              Ảnh này sẽ hiển thị ở sidebar, hồ sơ công khai và các khu vực giới thiệu
              nghệ nhân.
            </div>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Tên xưởng / nghệ danh
                </span>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl bg-[#F9F9F7] px-4 py-3 text-base font-bold outline-none ring-[#C84B31]/20 transition focus:ring-4"
                  placeholder="Ví dụ: Gốm Sứ Minh Đức"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Số điện thoại
                </span>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl bg-[#F9F9F7] px-4 py-3 outline-none ring-[#C84B31]/20 transition focus:ring-4"
                  placeholder="0987654321"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Chuyên môn
                </span>
                <input
                  required
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full rounded-xl bg-[#F9F9F7] px-4 py-3 outline-none ring-[#C84B31]/20 transition focus:ring-4"
                  placeholder="Gốm men lam, mây tre đan..."
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Khu vực / làng nghề
                </span>
                <input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl bg-[#F9F9F7] px-4 py-3 outline-none ring-[#C84B31]/20 transition focus:ring-4"
                  placeholder="Làng Gốm Bát Tràng, Hà Nội"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Câu chuyện cửa hàng
                </span>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full resize-none rounded-xl bg-[#F9F9F7] px-4 py-3 leading-6 outline-none ring-[#C84B31]/20 transition focus:ring-4"
                  placeholder="Kể về hành trình nghề, chất liệu, kỹ thuật hoặc cam kết của xưởng..."
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-[#C84B31] px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#C84B31]/15 transition-all hover:bg-[#9f3d28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
