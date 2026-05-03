'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/ui/Navbar';
import { ReviewList } from '@/components/ReviewList';

type ProfileData = {
  id: string;
  email: string;
  phone?: string;
  reputationScore: number;
  createdAt: string;
  roles?: { role: string; isActive: boolean }[];
  artisanProfile?: {
    fullName: string;
    slug: string;
    isVerified: boolean;
  } | null;
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
  _count?: {
    followers: number;
    following: number;
    products: number;
  };
  profile?: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    village?: string;
    slug?: string;
  };
  products?: any[];
};

type ReviewItem = {
  id: string;
  rating_quality: number;
  rating_accuracy: number;
  rating_shipping: number;
  rating_communication: number;
  rating_payment: number;
  comment?: string | null;
  images?: string[] | null;
  createdAt: string;
  reviewer?: {
    profile?: {
      display_name?: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
};

type ActiveTab = 'gallery' | 'reviews';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    village: '',
    avatar_url: '',
  });

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        const reviewRes = await api.get(`/users/${json.data.id}/reviews`);
        if (reviewRes.ok) {
          const reviewJson = await reviewRes.json();
          setReviews(reviewJson.data?.items ?? []);
        } else {
          setReviews([]);
        }
        setEditForm({
          display_name: json.data.profile?.display_name || '',
          bio: json.data.profile?.bio || '',
          village: json.data.profile?.village || '',
          avatar_url: json.data.profile?.avatar_url || '',
        });
      } else {
        router.push('/auth?mode=login');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      router.push('/auth?mode=login');
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    if (!user?.profile?.slug) {
      showToast('Hãy cập nhật tên hiển thị để tạo đường dẫn hồ sơ công khai', 'error');
      return;
    }

    const publicUrl = `${window.location.origin}/ho-so/${user.profile.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: user.profile.display_name || 'Hồ sơ Làng Nghề',
          url: publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(publicUrl);
        showToast('Đã sao chép liên kết hồ sơ công khai', 'success');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        showToast('Chưa thể chia sẻ hồ sơ lúc này', 'error');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folderType', 'avatars');

    try {
      const res = await api.post('/upload', formData);
      if (res.ok) {
        const json = await res.json();
        setEditForm(prev => ({ ...prev, avatar_url: json.urls[0] }));
        showToast('Tải ảnh lên thành công', 'success');
      } else {
        showToast('Lỗi tải ảnh', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.patch('/users/profile', editForm);
      if (res.ok) {
        showToast('Cập nhật hồ sơ thành công', 'success');
        setEditModalOpen(false);
        fetchProfile();
      } else {
        showToast('Không thể cập nhật hồ sơ', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối server', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#c84b31] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const userAvatar = resolveImageUrl(
    user?.profile?.avatar_url,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5LVvXgxx-E-_57gSL5yTTHo_76HhRKKKX0zvbt3BVTPVJ1MjIAA9uFcNBjB-jgeuX4jDcr8IPeK6Cnu-_xv26QGMYOEP6BC0FLFYTRNLGxMe6gQqdh3sMjLdOooevoZNZR6A6i-z4EAapm6gP-9bb8sLyLsebdzA9jFH7Pmsya64g91i6l-Qj1dQ-9K925hZ6yMeqQKhdobUcUtJUpbaLz4Z_eheMnOsw-FxAVh1c5RbGBFFrxa9cH3LeKO3ap-ovGyJdQTW6rL5',
  );
  const isArtisan = Boolean(
    user?.roles?.some((role) => role.role === 'artisan' && role.isActive),
  );
  const reviewTotal = user?.reviewSummary?.total ?? reviews.length;
  const averageRating = user?.reviewSummary?.averageRating ?? 0;
  const reputationLabel = Number(user?.reputationScore ?? 0)
    .toFixed(1)
    .replace('.0', '');
  const publicProfileHref = user?.profile?.slug
    ? `/ho-so/${user.profile.slug}`
    : null;
  return (
    <main className="min-h-screen bg-[#f9f9f9] selection:bg-[#c84b31]/10">
      <Navbar showSearch={false} activePage="profile" />
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-[#4A5D23]/95 text-white border-[#4A5D23]' : 'bg-red-600/95 text-white border-red-700'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative h-[300px] w-full overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqoJKLDnJFZH96UuNRWVfIJwY9ykwIKcYiplNWGjDRWDqnZRbd-aAmLFfL78554VNZ9JCsq4oagm9roa32lrjeUMuKp6peV_iS1WxPv3o1a5Vk8FfRroGGoUIg0S7sS4V_CLk1VhbpK3nT7KwWsRDcMHuFLkaD-O1g-sNXQPrOAeUkdF5QulOu-96Y6IDqg9J22scpaXwwUZpBK5bYygjGYrcwZqHeS1kNWyChfYdj_ZV7ti-63prCynG0GPGvwdA8I1LaYRHAactN" 
          alt="Kiln Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent"></div>
      </section>

      <section className="mx-auto max-w-7xl px-8 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-stone-100"
            >
              <div className="relative group mx-auto w-44 h-44 mb-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#c84b31] to-orange-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl relative z-10" 
                  src={userAvatar} 
                  alt="User Avatar" 
                />
                {isArtisan && (
                  <div className="absolute bottom-2 right-2 bg-[#4A5D23] text-white p-2 rounded-full shadow-lg z-20 border-2 border-white">
                    <span className="material-symbols-outlined text-sm block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-[#1A1C1C]">
                  {user?.profile?.display_name || user?.email.split('@')[0]}
                </h2>
                <p className="text-[#58413C]/60 font-medium flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {user?.profile?.village || 'Làng nghề Việt Nam'}
                </p>
                {isArtisan && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-[#4A5D23]/5 px-4 py-1.5 rounded-full text-[#4A5D23] text-xs font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-[#4A5D23] rounded-full animate-pulse"></span>
                    Nghệ nhân ưu tú
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 border-t border-stone-50 pt-10">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#1A1C1C]">{user?._count?.followers || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Người theo dõi</p>
                </div>
                <div className="text-center border-x border-stone-50 px-2">
                  <p className="text-2xl font-black text-[#c84b31]">{reputationLabel}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Uy tín</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-[#1A1C1C]">{user?._count?.products || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Sản phẩm</p>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <button 
                  onClick={() => setEditModalOpen(true)}
                  className="w-full bg-[#1A1C1C] text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Chỉnh sửa hồ sơ
                </button>
                <button 
                  onClick={handleShareProfile}
                  className="w-full bg-white text-[#1A1C1C] border-2 border-stone-100 font-bold py-4 rounded-2xl hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  Chia sẻ hồ sơ
                </button>
              </div>
            </motion.div>

            <div className="bg-[#4A5D23] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#4A5D23]/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               <h3 className="text-xl font-bold mb-4 relative z-10">Tiểu sử</h3>
               <p className="text-white/80 text-sm leading-relaxed font-medium italic relative z-10">
                 &ldquo;{user?.profile?.bio || 'Mỗi sản phẩm tôi làm ra đều chứa đựng một phần linh hồn của làng quê Việt Nam.'}&rdquo;
               </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(26,28,28,0.12)] backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`relative flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all sm:min-w-56 ${
                  activeTab === 'gallery'
                    ? 'bg-[#c84b31] text-white shadow-lg shadow-[#c84b31]/20'
                    : 'bg-stone-100 text-[#58413C] hover:bg-stone-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg">palette</span>
                Phòng trưng bày
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`relative flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all sm:min-w-64 ${
                  activeTab === 'reviews'
                    ? 'bg-[#c84b31] text-white shadow-lg shadow-[#c84b31]/20'
                    : 'bg-stone-100 text-[#58413C] hover:bg-stone-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg">rate_review</span>
                Nhận xét từ người khác
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-white text-[#c84b31]'
                }`}>
                  {reviewTotal}
                </span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'gallery' ? (
                <motion.div 
                  key="gallery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                  {user?.products && user.products.length > 0 ? (
                    user.products.map((p: any) => (
                      <ProductCard 
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        price={p.price_retail}
                        imageUrl={p.images?.[0]?.url}
                        artisanName={user.artisanProfile?.fullName || user.profile?.display_name || 'Nghệ nhân'}
                        categoryName={p.category?.name}
                        slug={p.slug || p.id}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 rounded-[2rem] border-2 border-dashed border-[#c84b31]/25 bg-[#fffaf7] px-6 py-16 text-center shadow-inner">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#c84b31] shadow-sm">
                        <span className="material-symbols-outlined text-3xl">palette</span>
                      </div>
                      <p className="text-lg font-black text-[#1A1C1C]">Chưa có sản phẩm nào trong phòng trưng bày</p>
                      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#58413C]/70">
                        Khi bạn đăng sản phẩm đầu tiên, tác phẩm sẽ xuất hiện ở đây để mọi người dễ xem và mua.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="reviews"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ReviewList
                    reviews={reviews}
                    reviewCount={reviewTotal}
                    title="Nhận xét từ người khác"
                    emptyMessage="Nhận xét từ người khác sau các đơn đã hoàn tất sẽ được hiển thị tại đây."
                    initialVisibleCount={3}
                    showAttachments={false}
                    reviewKind="artisan"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-stone-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#1A1C1C]">Chỉnh sửa hồ sơ</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-black">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group w-32 h-32">
                    <img 
                      className={`w-full h-full object-cover rounded-full border-4 border-stone-50 transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`} 
                      src={resolveImageUrl(editForm.avatar_url, '/fallback-avatar.png')} 
                      alt="Avatar Preview" 
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <span className="material-symbols-outlined">photo_camera</span>
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                  </div>
                  <p className="text-xs font-bold text-[#58413C]/40 uppercase tracking-widest">Thay đổi ảnh đại diện</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#58413C]/60 ml-2">Tên hiển thị</label>
                    <input 
                      className="w-full bg-[#f9f9f9] border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#c84b31]/20 transition-all outline-none"
                      value={editForm.display_name}
                      onChange={e => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Nhập tên hiển thị của bạn..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#58413C]/60 ml-2">Làng nghề / Địa chỉ</label>
                    <input 
                      className="w-full bg-[#f9f9f9] border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#c84b31]/20 transition-all outline-none"
                      value={editForm.village}
                      onChange={e => setEditForm(prev => ({ ...prev, village: e.target.value }))}
                      placeholder="VD: Làng lụa Vạn Phúc..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#58413C]/60 ml-2">Giới thiệu bản thân</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-[#f9f9f9] border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-[#c84b31]/20 transition-all outline-none resize-none"
                      value={editForm.bio}
                      onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Chia sẻ một chút về đam mê của bạn..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-4 font-bold text-[#58413C]/60 hover:text-black transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    disabled={isUpdating || uploading}
                    className="flex-1 bg-[#c84b31] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-[#c84b31]/20 disabled:opacity-50"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
