'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('12345678');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [expertise, setExpertise] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cccdUrl, setCccdUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUploadAvatar(file: File) {
    if (!file) return;
    setMessage('Getting signed upload URL...');

    const signatureResp = await fetch(`${API_BASE}/upload/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'artisan-avatars' }),
    });

    if (!signatureResp.ok) {
      setMessage('Không thể lấy chữ ký upload Cloudinary');
      return;
    }

    const signed = await signatureResp.json();
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('timestamp', signed.timestamp.toString());
    form.append('signature', signed.signature);
    form.append('folder', signed.folder);

    setMessage('Uploading image to Cloudinary...');

    const cloudResp = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    });

    if (!cloudResp.ok) {
      setMessage('Upload ảnh thất bại');
      return;
    }

    const data = await cloudResp.json();
    setAvatarUrl(data.secure_url);
    setMessage('Upload ảnh thành công!');
  }

  async function createArtisan(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('Đang đăng nhập...');

    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setMessage('Đăng nhập thất bại, cần đăng ký trước.');
        setLoading(false);
        return;
      }

      const loginData = await loginRes.json();
      const token = loginData.accessToken;
      setMessage('Tạo hồ sơ artisan...');

      const profileRes = await fetch(`${API_BASE}/artisans/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, description, expertise, location, avatarUrl, cccdUrl }),
      });

      if (!profileRes.ok) {
        const errorData = await profileRes.json().catch(() => null);
        setMessage(`Tạo hồ sơ thất bại: ${errorData?.message || profileRes.statusText}`);
        setLoading(false);
        return;
      }

      const data = await profileRes.json();
      setMessage(`Tạo thành công! Slug: ${data.slug}. Xem tại /nghe-nhan/${data.slug}`);
    } catch (error) {
      setMessage('Có lỗi khi tạo profile. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.08),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(244,114,182,0.07),transparent_35%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
        <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm md:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Lang Nghe Workspace</p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight text-zinc-100 md:text-4xl">
            Tạo hồ sơ nghệ nhân nhanh, sạch, tối giản.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-zinc-300">
            Luồng hiện tại đã có: đăng nhập, tạo hoặc cập nhật hồ sơ artisan, upload ảnh lên Cloudinary, và xem trang public theo slug SSR.
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            API base: <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200">{API_BASE}</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="/auth"
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition-all duration-200 ease-out hover:border-zinc-600 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Mo trang auth
            </Link>
            <Link
              href="/dashboard/nghe-nhan"
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition-all duration-200 ease-out hover:border-zinc-600 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Mo dashboard nghe nhan
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-100 md:text-2xl">Tạo hồ sơ nghệ nhân</h2>
            <p className="mt-2 text-sm text-zinc-400">Hoàn tất thông tin cơ bản và upload avatar trước khi tạo profile.</p>

            <form className="mt-6 space-y-4" onSubmit={createArtisan}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                  required
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  type="password"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                  required
                />
              </div>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                required
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                rows={3}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="Chuyên môn"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Địa điểm"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Avatar URL"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                />
                <input
                  value={cccdUrl}
                  onChange={(e) => setCccdUrl(e.target.value)}
                  placeholder="CCCD URL"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none transition-all duration-200 ease-out placeholder:text-zinc-500 focus-visible:border-violet-500"
                />
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <label className="mb-2 block text-sm text-zinc-400">Upload avatar lên Cloudinary</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-200 hover:file:bg-zinc-700"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleUploadAvatar(file);
                  }}
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-violet-600 px-4 py-2 font-semibold text-white transition-all duration-200 ease-out hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Tạo hồ sơ artisan'}
              </button>
            </form>

            {message && <p className="mt-4 break-words rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">{message}</p>}
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-zinc-100">Luồng đã có</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>Đăng nhập lấy access token</li>
                <li>Tạo hoặc cập nhật hồ sơ nghệ nhân</li>
                <li>Upload avatar lên Cloudinary</li>
                <li>Xem hồ sơ public bằng slug</li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-zinc-100">Link xem profile</h3>
              <p className="mt-2 text-sm text-zinc-400">Sau khi tạo thành công, mở:</p>
              <p className="mt-3 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
                /nghe-nhan/your-slug
              </p>
              {avatarUrl && (
                <div className="mt-4">
                  <p className="text-sm text-zinc-400">Avatar preview</p>
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={640}
                    height={320}
                    className="mt-2 max-h-44 w-full rounded-md border border-zinc-700 object-cover"
                  />
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
