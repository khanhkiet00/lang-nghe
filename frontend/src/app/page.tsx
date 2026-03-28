'use client';

import { FormEvent, useState } from 'react';

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
    <main className="min-h-screen bg-[#09090B] text-zinc-100 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-3">Làng Nghề - Trạng thái</h1>
          <p className="text-zinc-300 mb-4">Đã sẵn sàng cho luồng đăng ký artisan, upload Cloudinary, và xem profile SSR.</p>
          <p className="text-zinc-400">API base: <code className="text-violet-300">{API_BASE}</code></p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Tạo hồ sơ nghệ nhân</h2>

          <form className="space-y-4" onSubmit={createArtisan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" required />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" required />
            </div>

            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Giới thiệu" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" rows={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="Chuyên môn" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Avatar URL" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
              <input value={cccdUrl} onChange={(e) => setCccdUrl(e.target.value)} placeholder="CCCD/ID URL" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Upload avatar lên Cloudinary</label>
              <input type="file" accept="image/*" className="w-full text-sm text-zinc-200" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleUploadAvatar(file);
              }} />
            </div>

            <button type="submit" className="bg-violet-600 hover:bg-violet-500 transition-all rounded-md px-4 py-2 text-white font-semibold" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Tạo hồ sơ artisan'}
            </button>
          </form>

          {message && <p className="text-sm text-zinc-300 mt-3 break-words">{message}</p>}
          {avatarUrl && (
            <div className="mt-4">
              <p className="text-zinc-300 text-sm">Ảnh avatar tải lên:</p>
              <img src={avatarUrl} alt="avatar" className="mt-2 max-h-40 rounded-md border border-zinc-700 object-cover" />
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Xem profile nghệ nhân</h2>
          <p className="text-zinc-300">Sau khi tạo thành công, mở đường dẫn:</p>
          <pre className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200">http://localhost:3000/nghe-nhan/your-slug</pre>
        </section>
      </div>
    </main>
  );
}
