'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { api } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function RegisterArtisanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    description: '',
    expertise: '',
    location: '',
    avatarUrl: '',
    cccdUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCccd, setUploadingCccd] = useState(false);

  // EKYC STATES
  const [fileCccd, setFileCccd] = useState<File | null>(null);
  const [checkingEkyc, setCheckingEkyc] = useState(false);
  const [ekycMessage, setEkycMessage] = useState('');
  const [faceMatched, setFaceMatched] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('langnghe_access_token') : null;
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
      if (data.accessToken) {
        localStorage.setItem('langnghe_access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('langnghe_refresh_token', data.refreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'cccdUrl') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'avatarUrl') setUploadingAvatar(true);
    else {
      setUploadingCccd(true);
      setFileCccd(file);
      setFaceMatched(null);
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('files', file);
      formDataUpload.append('folderType', field === 'avatarUrl' ? 'artisans' : 'ekyc');

      const res = await api.post('/upload', formDataUpload);

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, [field]: data.urls?.[0] || '' }));

      if (field === 'cccdUrl') {
        setCheckingEkyc(true);
        setEkycMessage('⏳ AI Đang bóc tách thông tin CCCD...');
        
        const ocrFormData = new FormData();
        ocrFormData.append('image', file);

        const resOcr = await api.post('/ekyc/ocr', ocrFormData);

        if (resOcr.ok) {
          const dataOcr = await resOcr.json();
          if (dataOcr.name) {
            setFormData(prev => ({ ...prev, fullName: dataOcr.name }));
            setEkycMessage(`✅ Đã tự động nhận diện: ${dataOcr.name}`);
          } else {
            setEkycMessage('⚠️ Văn bản mờ, vui lòng tự điền Tên.');
          }
        } else {
          const errData = await resOcr.json().catch(() => ({}));
          setEkycMessage(`❌ Từ chối: ${errData.message || 'Không tìm thấy CCCD'}`);
          setFileCccd(null);
          setFormData(prev => ({ ...prev, cccdUrl: '' }));
        }
      }
    } catch (err) {
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      if (field === 'avatarUrl') setUploadingAvatar(false);
      else {
        setUploadingCccd(false);
        setCheckingEkyc(false);
      }
    }
  }

  async function handleSelfieUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fileCccd) {
      alert('Vui lòng tải CCCD hợp lệ lên trước!');
      return;
    }

    setCheckingEkyc(true);
    setEkycMessage('⏳ Đang so khớp khuôn mặt...');
    setFaceMatched(null);

    const matchFormData = new FormData();
    matchFormData.append('files', fileCccd);
    matchFormData.append('files', file);

    try {
      const resMatch = await api.post('/ekyc/face-match', matchFormData);

      if (resMatch.ok) {
        const dataMatch = await resMatch.json();
        const similarityScore = Number(dataMatch.similarity);
        
        if (dataMatch.match || similarityScore >= 40) {
          setFaceMatched(true);
          setEkycMessage(`✅ Chính chủ! Độ khớp: ${similarityScore}% (Đã duyệt)`);
        } else {
          setFaceMatched(false);
          setEkycMessage(`❌ Khuôn mặt không khớp (${similarityScore}%). Yêu cầu >40%. Vui lòng thử lại!`);
        }
      } else {
        const errData = await resMatch.json().catch(() => ({}));
        setFaceMatched(false);
        setEkycMessage(`❌ Lỗi ảnh Selfie: ${errData.message || 'Không xác định.'}`);
      }
    } catch {
       setFaceMatched(false);
       setEkycMessage('Lỗi khi gọi AI FaceMatch.');
    } finally {
      setCheckingEkyc(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (faceMatched !== true) {
      setError('Bạn chưa xác thực Gương mặt chính chủ thành công (Liveness). Vui lòng tải selfie!');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/artisans/register', formData);

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        const errMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setError(`Lỗi: ${errMsg || 'Không thể đăng ký lúc này'}`);
        setLoading(false);
        return;
      }

      const refreshed = await handleRefreshTokens();
      if (refreshed) {
        window.location.href = '/';
      } else {
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
      <Navbar showSearch={false} activePage="none" />

      <section className="mx-auto max-w-2xl px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Trở Thành Nghệ Nhân</h1>
          <p className="mt-2 text-lg text-zinc-500">
            Hệ thống áp dụng công nghệ eKYC FPT.AI chống mạo danh để gia nhập mạng lưới.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-zinc-100">
          
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mb-6">
            <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <span className="bg-emerald-200 text-emerald-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">🔒</span>
              Xác Minh Sinh Trắc Học eKYC (Bắt buộc)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2 border border-dashed border-emerald-300 rounded-xl p-4 bg-white">
                <label className="text-xs uppercase tracking-widest text-emerald-700 font-bold block mb-2">1. Ảnh Căn Cước (Face ID) *</label>
                {fileCccd ? (
                  <div className="text-xs font-semibold text-emerald-600 truncate py-1">✓ Đã nạp CCCD</div>
                ) : (
                  <input
                    type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cccdUrl')}
                    disabled={uploadingCccd} required
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                  />
                )}
               </div>

               <div className={`space-y-2 border border-dashed rounded-xl p-4 transition-all ${fileCccd ? 'border-emerald-300 bg-white' : 'border-zinc-200 bg-zinc-50 opacity-50 pointer-events-none'}`}>
                 <label className="text-xs uppercase tracking-widest text-emerald-700 font-bold block mb-2">2. Kiểm Tra Gương Mặt Selfie *</label>
                 {faceMatched ? (
                    <div className="text-xs font-semibold text-emerald-600 truncate py-1">✓ Đã so khớp khuôn mặt</div>
                 ) : (
                   <input
                    type="file" accept="image/*" onChange={handleSelfieUpload}
                    disabled={checkingEkyc || !fileCccd} required
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#C84B31]/10 file:text-[#C84B31] hover:file:bg-[#C84B31]/20 cursor-pointer"
                  />
                 )}
               </div>
            </div>

            {(ekycMessage || checkingEkyc) && (
              <div className="mt-4 text-sm font-semibold p-3 rounded-lg bg-emerald-100/50 text-emerald-800 flex items-center gap-2">
                {checkingEkyc && <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>}
                {ekycMessage}
              </div>
            )}
            {faceMatched === false && (
              <div className="mt-2 text-xs font-semibold text-red-500">⚠ Vui lòng chụp lại ảnh Selfie trùng khớp.</div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Nghệ Danh / Họ Tên *</label>
              <input
                type="text" required value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all font-bold text-[#C84B31]"
                placeholder="VD: Gốm Sứ Minh Đức"
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Số Điện Thoại Liên Hệ *</label>
              <input
                type="tel" required value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
                placeholder="0987 654 321"
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Lĩnh Vực Chuyên Môn *</label>
              <input
                type="text" required value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
                placeholder="VD: Gốm Men Lam"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Khu Vực Làm Việc / Tên Làng *</label>
              <input
                type="text" required value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all"
                placeholder="VD: Làng Gốm Bát Tràng, Hà Nội"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 border border-dashed border-zinc-300 rounded-xl p-4 bg-[#F9F9F7]">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-2">Ảnh Đại Diện Brand / Logo Cửa Hàng</label>
              {formData.avatarUrl ? (
                 <div className="text-sm font-semibold text-emerald-600">✓ Đã tải lên thành công</div>
              ) : (
                <input
                  type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatarUrl')} disabled={uploadingAvatar}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 cursor-pointer"
                />
              )}
              {uploadingAvatar && <p className="text-xs text-zinc-400 mt-2">Đang tải lên...</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Giới Thiệu Câu Chuyện Của Bạn</label>
              <textarea
                rows={4} value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl bg-[#F2F4F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#C84B31]/30 transition-all resize-none"
                placeholder="Chia sẻ về đam mê và chặng đường nghề của bạn..."
              />
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploadingAvatar || uploadingCccd || checkingEkyc || !faceMatched}
            className="w-full rounded-xl bg-[#C84B31] py-4 font-bold text-white transition-all hover:bg-[#9f3d28] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang Thiết Lập...' : 'Xác Nhận & Trở Thành Nghệ Nhân'}
          </button>
        </form>
      </section>
    </main>
  );
}
