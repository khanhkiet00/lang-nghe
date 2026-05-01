'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import { ProductCard } from '@/components/ProductCard';

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

  const avatarDisplay = resolveImageUrl(editForm.avatar_url, '/fallback-avatar.png');

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
  const getReviewAverage = (review: ReviewItem) =>
    (
      (review.rating_quality +
        review.rating_accuracy +
        review.rating_shipping +
        review.rating_communication +
        review.rating_payment) /
      5
    )
      .toFixed(1)
      .replace('.0', '');

  return (
    <main className="min-h-screen bg-[#f9f9f9] selection:bg-[#c84b31]/10">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-[#4A5D23]/95 text-white border-[#4A5D23]' : 'bg-red-600/95 text-white border-red-700'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Area */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqoJKLDnJFZH96UuNRWVfIJwY9ykwIKcYiplNWGjDRWDqnZRbd-aAmLFfL78554VNZ9JCsq4oagm9roa32lrjeUMuKp6peV_iS1WxPv3o1a5Vk8FfRroGGoUIg0S7sS4V_CLk1VhbpK3nT7KwWsRDcMHuFLkaD-O1g-sNXQPrOAeUkdF5QulOu-96Y6IDqg9J22scpaXwwUZpBK5bYygjGYrcwZqHeS1kNWyChfYdj_ZV7ti-63prCynG0GPGvwdA8I1LaYRHAactN" 
          alt="Kiln Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent"></div>
        <div className="absolute top-8 left-8">
           <button onClick={() => router.back()} className="flex items-center gap-2 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold transition-all">
             <span className="material-symbols-outlined">arrow_back</span> Quay lại
           </button>
        </div>
      </section>

      {/* Profile Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative">
              <img className="w-full h-full object-cover" src={userAvatar} alt={user?.profile?.display_name} />
            </div>
            {user?.artisanProfile?.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-[#52652a] p-3 rounded-2xl shadow-xl border-4 border-white">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            )}
          </motion.div>

          <div className="flex-1 pb-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-6xl font-black tracking-tight text-[#1a1c1c] "
                >
                  {user?.profile?.display_name || 'Người dùng mới'}
                </motion.h1>
                <div className="flex items-center gap-3 mt-3">
                   <p className="text-[#52652a] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full bg-[#52652a]"></span>
                     {user?.profile?.village || 'Di sản Việt Nam'}
                   </p>
                   <span className="text-zinc-300">•</span>
                   <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                     {isArtisan ? 'Nghệ nhân' : 'Người yêu thủ công'}
                   </p>
                   <span className="text-zinc-300">•</span>
                   <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                     Tham gia: {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
                   </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setEditModalOpen(true)}
                  className="px-10 py-4 bg-[#c84b31] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#c84b31]/20 hover:scale-[0.98] transition-transform"
                >
                  Chỉnh sửa hồ sơ
                </button>
                {publicProfileHref && (
                  <button
                    onClick={() => router.push(publicProfileHref)}
                    className="hidden sm:flex items-center gap-2 px-5 py-4 bg-white text-zinc-800 rounded-2xl shadow-lg border border-black/5 hover:bg-zinc-50 transition-colors font-black uppercase tracking-[0.12em] text-xs"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    Xem công khai
                  </button>
                )}
                <button onClick={handleShareProfile} className="p-4 bg-white text-zinc-800 rounded-2xl shadow-lg border border-black/5 hover:bg-zinc-50 transition-colors">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Stats Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)] border border-black/[0.03]"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-6 flex items-center gap-4">
               Hành trình Nghệ thuật
               <span className="flex-1 h-px bg-zinc-100"></span>
            </h3>
            <p className="text-2xl font-medium leading-relaxed text-zinc-700 ">
              {user?.profile?.bio || 'Chưa có câu chuyện nào được chia sẻ. Hãy bắt đầu kể về đam mê di sản của bạn ngay hôm nay.'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#c84b31]/5 p-12 rounded-[3rem] border border-[#c84b31]/10 flex flex-col justify-between"
          >
            <div className="grid grid-cols-2 gap-y-10">
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{reputationLabel}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Uy tín</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{reviewTotal}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Đánh giá</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?._count?.products || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Tác phẩm</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?._count?.followers || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Người theo dõi</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?._count?.following || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Đang theo dõi</span>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-[#c84b31]/10">
               <p className="text-[11px] font-bold text-[#c84b31]/60 italic -tracking-wide">
                 {reviewTotal > 0
                   ? `Điểm đánh giá trung bình ${averageRating.toFixed(1).replace('.0', '')}/5 từ giao dịch thật.`
                   : 'Hồ sơ sẽ có điểm uy tín khi phát sinh đánh giá sau đơn hàng.'}
               </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 pb-24">
          <div className="flex gap-12 border-b border-zinc-100 px-2 mb-12 overflow-x-auto">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-6 font-black uppercase tracking-[0.2em] text-xs transition-colors ${
                activeTab === 'gallery'
                  ? 'border-b-4 border-[#c84b31] text-[#1a1c1c]'
                  : 'text-zinc-400 hover:text-[#c84b31]'
              }`}
            >
                Phòng trưng bày
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-6 font-black uppercase tracking-[0.2em] text-xs transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-4 border-[#c84b31] text-[#1a1c1c]'
                  : 'text-zinc-400 hover:text-[#c84b31]'
              }`}
            >
              Đánh giá chung
            </button>
          </div>

          {activeTab === 'gallery' && (
            user?.products && user.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {user.products.map((p: any) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price_retail}
                  imageUrl={p.images?.[0]?.url}
                  artisanName={user?.profile?.display_name}
                  categoryName={p.category?.name}
                  slug={p.slug}
                  averageRating={averageRating}
                  reviewCount={reviewTotal}
                  followerCount={user?._count?.followers}
                />
              ))}
            </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c84b31]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[#c84b31]/40 text-3xl">box_edit</span>
                </div>
                <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Chưa có tác phẩm trưng bày</p>
                <button
                  onClick={() => router.push(isArtisan ? '/nghe-nhan/san-pham/them' : '/nghe-nhan/dang-ky')}
                  className="mt-6 rounded-2xl bg-[#1a1c1c] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-colors hover:bg-[#c84b31]"
                >
                  {isArtisan ? 'Đăng tác phẩm đầu tiên' : 'Trở thành nghệ nhân'}
                </button>
              </div>
            )
          )}

          {activeTab === 'reviews' && (
            reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-[2rem] border border-black/[0.03] bg-white p-8 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#1a1c1c]">
                          ★ {getReviewAverage(review)}/5
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <p className="text-right text-xs font-bold text-[#52652a]">
                        {review.reviewer?.profile?.display_name || 'Người mua đã xác thực'}
                      </p>
                    </div>
                    <p className="mt-6 text-base font-medium leading-8 text-zinc-600">
                      {review.comment || 'Người đánh giá chưa để lại bình luận.'}
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 sm:grid-cols-5">
                      <span>Chất lượng {review.rating_quality}</span>
                      <span>Mô tả {review.rating_accuracy}</span>
                      <span>Giao hàng {review.rating_shipping}</span>
                      <span>Trao đổi {review.rating_communication}</span>
                      <span>Thanh toán {review.rating_payment}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[#c84b31]/20 bg-white p-12 text-center">
                <p className="text-sm font-bold text-zinc-500">
                  Chưa có đánh giá sau giao dịch. Khi đơn hàng hoàn tất và hai bên đánh giá nhau, điểm uy tín sẽ xuất hiện tại đây.
                </p>
              </div>
            )
          )}
          </div>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setEditModalOpen(false)}
               className="absolute inset-0 bg-[#1a1c1c]/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <header className="p-10 border-b border-zinc-100 flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-[#1a1c1c] tracking-tight">Chỉnh sửa hồ sơ</h2>
                   <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Lưu giữ bản sắc cá nhân</p>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                  <span className="material-symbols-outlined text-zinc-400">close</span>
                </button>
              </header>

              <form onSubmit={handleUpdateProfile} className="p-10 space-y-8 overflow-y-auto overflow-hidden">
                <div className="flex flex-col items-center gap-6 mb-4">
                   <div className="relative w-32 h-32 group">
                      <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-zinc-100 shadow-md">
                        <img className="w-full h-full object-cover" src={avatarDisplay} alt="Preview" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem] cursor-pointer">
                         <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                         <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-8 w-8 border-2 border-[#c84b31] border-t-transparent rounded-full" />
                        </div>
                      )}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Thay đổi ảnh đại diện</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-2">Tên hiển thị</label>
                    <input 
                      required
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl font-bold text-zinc-800 focus:border-[#c84b31]/40 outline-none transition-all"
                      placeholder="Ví dụ: Nghệ nhân Minh Nguyễn"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-2">Làng nghề / Xuất xứ</label>
                    <input 
                      value={editForm.village}
                      onChange={(e) => setEditForm({...editForm, village: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 py-4 px-6 rounded-2xl font-bold text-zinc-800 focus:border-[#c84b31]/40 outline-none transition-all"
                      placeholder="Ví dụ: Làng gốm Bát Tràng"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-2">Câu chuyện cá nhân</label>
                    <textarea 
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 p-6 rounded-[1.75rem] font-medium text-zinc-800 focus:border-[#c84b31]/40 outline-none transition-all min-h-[120px] leading-relaxed"
                      placeholder="Kể lại hành trình của bạn..."
                    />
                  </div>
                </div>

                <footer className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-zinc-500 hover:text-zinc-800 transition-colors">Hủy bỏ</button>
                  <button 
                    type="submit" 
                    disabled={isUpdating || uploading}
                    className="flex-[2] bg-[#1a1c1c] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/20 hover:bg-[#c84b31] transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Đang lưu trữ di sản...' : 'Cập nhật ngay'}
                  </button>
                </footer>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-[#1a1c1c] rounded-t-[3rem] py-20 px-12 mt-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h4 className="text-white text-xl font-black tracking-tight">Heritage Hearth</h4>
               <p className="text-zinc-500 text-sm mt-2">© 2024 Làng Nghề Platform. Crafted with soul.</p>
            </div>
            <div className="flex gap-8">
               <span className="material-symbols-outlined text-zinc-500 hover:text-white transition-colors cursor-pointer">social_leaderboard</span>
               <span className="material-symbols-outlined text-zinc-500 hover:text-white transition-colors cursor-pointer">camera</span>
            </div>
         </div>
      </footer>
    </main>
  );
}
