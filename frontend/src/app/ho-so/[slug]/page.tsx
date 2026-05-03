'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import { Navbar } from '@/components/ui/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ReviewList } from '@/components/ReviewList';

type ProfileData = {
  id: string;
  email: string;
  reputationScore: number;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    products: number;
  };
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
  profile: {
    display_name: string;
    avatar_url?: string;
    bio?: string;
    village?: string;
    slug: string;
  };
  products?: any[];
};

type ReviewItem = {
  id: string;
  comment?: string | null;
  createdAt: string;
  rating_quality: number;
  rating_accuracy: number;
  rating_shipping: number;
  rating_communication: number;
  rating_payment: number;
  images?: string[] | null;
  reviewer?: {
    profile?: {
      display_name?: string | null;
    } | null;
  } | null;
};

type ActiveTab = 'gallery' | 'reviews';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [user, setUser] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');
  const [me, setMe] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/public/${slug}`);
      if (!res.ok) {
        router.push('/');
        return;
      }

      const json = await res.json();
      const profileData = json.data;
      const transformed: ProfileData = {
        id: profileData.user.id,
        email: profileData.user.email,
        reputationScore: profileData.user.reputationScore,
        createdAt: profileData.user.createdAt,
        _count: profileData.user._count,
        reviewSummary: profileData.user.reviewSummary,
        profile: {
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          village: profileData.village,
          slug: profileData.slug,
        },
        products: profileData.user.products,
      };

      setUser(transformed);

      const reviewRes = await api.get(`/users/${transformed.id}/reviews`);
      if (reviewRes.ok) {
        const reviewJson = await reviewRes.json();
        setReviews(reviewJson.data?.items ?? []);
      } else {
        setReviews([]);
      }

      const meRes = await api.get('/users/me');
      if (meRes.ok) {
        const meJson = await meRes.json();
        setMe(meJson.data);

        if (meJson.data.id !== transformed.id) {
          const statusRes = await api.get(`/users/${transformed.id}/follow-status`);
          if (statusRes.ok) {
            const statusJson = await statusRes.json();
            setIsFollowing(statusJson.data.isFollowing);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!me) {
      router.push('/auth?mode=login');
      return;
    }

    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${user?.id}/follow`);
      if (res.ok) {
        const json = await res.json();
        setIsFollowing(json.data.following);
        showToast(json.data.following ? 'Đã bắt đầu theo dõi' : 'Đã bỏ theo dõi', 'success');

        if (user?._count) {
          setUser({
            ...user,
            _count: {
              ...user._count,
              followers: user._count.followers + (json.data.following ? 1 : -1),
            },
          });
        }
      }
    } catch {
      showToast('Thao tác thất bại', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = async () => {
    const publicUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: user?.profile.display_name || 'Hồ sơ Làng Nghề',
          url: publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(publicUrl);
        showToast('Đã sao chép liên kết hồ sơ', 'success');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        showToast('Chưa thể chia sẻ hồ sơ lúc này', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-[#c84b31] border-t-transparent"
        />
      </div>
    );
  }

  const userAvatar = resolveImageUrl(
    user?.profile?.avatar_url,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5LVvXgxx-E-_57gSL5yTTHo_76HhRKKKX0zvbt3BVTPVJ1MjIAA9uFcNBjB-jgeuX4jDcr8IPeK6Cnu-_xv26QGMYOEP6BC0FLFYTRNLGxMe6gQqdh3sMjLdOooevoZNZR6A6i-z4EAapm6gP-9bb8sLyLsebdzA9jFH7Pmsya64g91i6l-Qj1dQ-9K925hZ6yMeqQKhdobUcUtJUpbaLz4Z_eheMnOsw-FxAVh1c5RbGBFFrxa9cH3LeKO3ap-ovGyJdQTW6rL5',
  );
  const isMe = me?.id === user?.id;
  const reviewTotal = user?.reviewSummary?.total ?? reviews.length;
  const reputationLabel = Number(user?.reputationScore ?? 0)
    .toFixed(1)
    .replace('.0', '');

  return (
    <main className="min-h-screen bg-[#f9f9f9] selection:bg-[#c84b31]/10">
      <Navbar showSearch={false} activePage="none" />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed left-1/2 top-24 z-[100] flex items-center gap-3 rounded-full border px-6 py-4 text-sm font-bold shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-[#4A5D23] bg-[#4A5D23]/95 text-white'
                : 'border-red-700 bg-red-600/95 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative h-[300px] w-full overflow-hidden">
        <img
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqoJKLDnJFZH96UuNRWVfIJwY9ykwIKcYiplNWGjDRWDqnZRbd-aAmLFfL78554VNZ9JCsq4oagm9roa32lrjeUMuKp6peV_iS1WxPv3o1a5Vk8FfRroGGoUIg0S7sS4V_CLk1VhbpK3nT7KwWsRDcMHuFLkaD-O1g-sNXQPrOAeUkdF5QulOu-96Y6IDqg9J22scpaXwwUZpBK5bYygjGYrcwZqHeS1kNWyChfYdj_ZV7ti-63prCynG0GPGvwdA8I1LaYRHAactN"
          alt="Kiln Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent"></div>
      </section>

      <section className="relative z-10 mx-auto -mt-32 max-w-7xl px-8 pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] border border-stone-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            >
              <div className="group relative mx-auto mb-8 h-44 w-44">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#c84b31] to-orange-400 opacity-20 blur-2xl transition-opacity group-hover:opacity-40"></div>
                <img
                  className="relative z-10 h-full w-full rounded-full border-4 border-white object-cover shadow-2xl"
                  src={userAvatar}
                  alt={user?.profile?.display_name || 'User Avatar'}
                />
                {user?.products && user.products.length > 0 && (
                  <div className="absolute bottom-2 right-2 z-20 rounded-full border-2 border-white bg-[#4A5D23] p-2 text-white shadow-lg">
                    <span className="material-symbols-outlined block text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black tracking-tight text-[#1A1C1C]">
                  {user?.profile?.display_name || user?.email.split('@')[0]}
                </h2>
                <p className="flex items-center justify-center gap-2 font-medium text-[#58413C]/60">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {user?.profile?.village || 'Làng nghề Việt Nam'}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-stone-50 pt-10">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#1A1C1C]">{user?._count?.followers || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Người theo dõi</p>
                </div>
                <div className="border-x border-stone-50 px-2 text-center">
                  <p className="text-2xl font-black text-[#c84b31]">{reputationLabel}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Uy tín</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-[#1A1C1C]">{user?._count?.products || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#58413C]/40">Sản phẩm</p>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                {isMe ? (
                  <button
                    onClick={() => router.push('/ho-so')}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1A1C1C] py-4 font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-black"
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    Hồ sơ của tôi
                  </button>
                ) : (
                  <button
                    disabled={followLoading}
                    onClick={handleToggleFollow}
                    className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold shadow-xl transition-all disabled:opacity-60 ${
                      isFollowing
                        ? 'border-2 border-[#c84b31]/20 bg-white text-[#c84b31] shadow-[#c84b31]/5 hover:bg-stone-50'
                        : 'bg-[#1A1C1C] text-white shadow-black/10 hover:bg-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{isFollowing ? 'check_circle' : 'person_add'}</span>
                    {followLoading ? 'Đang xử lý...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                )}
                <button
                  onClick={handleShareProfile}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-stone-100 bg-white py-4 font-bold text-[#1A1C1C] transition-all hover:bg-stone-50"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  Chia sẻ hồ sơ
                </button>
              </div>
            </motion.div>

            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#4A5D23] p-10 text-white shadow-2xl shadow-[#4A5D23]/20">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
              <h3 className="relative z-10 mb-4 text-xl font-bold">Tiểu sử</h3>
              <p className="relative z-10 text-sm font-medium italic leading-relaxed text-white/80">
                &ldquo;{user?.profile?.bio || 'Mỗi sản phẩm tôi làm ra đều chứa đựng một phần linh hồn của làng quê Việt Nam.'}&rdquo;
              </p>
            </div>
          </div>

          <div className="space-y-8 rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(26,28,28,0.12)] backdrop-blur-md sm:p-8 lg:col-span-8">
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
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-white text-[#c84b31]'}`}>
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
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2"
                >
                  {user?.products && user.products.length > 0 ? (
                    user.products.map((p: any) => (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        price={p.price_retail}
                        imageUrl={p.images?.[0]?.url}
                        artisanName={user.profile?.display_name || 'Nghệ nhân'}
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
                        Khi người dùng đăng sản phẩm đầu tiên, tác phẩm sẽ xuất hiện ở đây.
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
                    emptyMessage="Chưa có nhận xét về nghệ nhân sau giao dịch hoàn tất."
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
    </main>
  );
}
