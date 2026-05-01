'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';
import { ProductCard } from '@/components/ProductCard';

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
  profile: {
    display_name: string;
    avatar_url?: string;
    bio?: string;
    village?: string;
    slug: string;
  };
  products?: any[];
};

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [me, setMe] = useState<any>(null);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
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
      // Fetch public profile
      const res = await api.get(`/users/public/${slug}`);
      if (res.ok) {
        const json = await res.json();
        const profileData = json.data;
        
        // Transform the structure to match ProfileData type
        const transformed: ProfileData = {
          id: profileData.user.id,
          email: profileData.user.email,
          reputationScore: profileData.user.reputationScore,
          createdAt: profileData.user.createdAt,
          _count: profileData.user._count,
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

        // Fetch current user (me) to check follow status and if it's "myself"
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
      } else {
        router.push('/');
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
        
        // Update local counts
        if (user && user._count) {
          setUser({
            ...user,
            _count: {
              ...user._count,
              followers: user._count.followers + (json.data.following ? 1 : -1)
            }
          });
        }
      }
    } catch (err) {
      showToast('Thao tác thất bại', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-[#c84b31] border-t-transparent rounded-full" />
      </div>
    );
  }

  const userAvatar = resolveImageUrl(
    user?.profile?.avatar_url,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5LVvXgxx-E-_57gSL5yTTHo_76HhRKKKX0zvbt3BVTPVJ1MjIAA9uFcNBjB-jgeuX4jDcr8IPeK6Cnu-_xv26QGMYOEP6BC0FLFYTRNLGxMe6gQqdh3sMjLdOooevoZNZR6A6i-z4EAapm6gP-9bb8sLyLsebdzA9jFH7Pmsya64g91i6l-Qj1dQ-9K925hZ6yMeqQKhdobUcUtJUpbaLz4Z_eheMnOsw-FxAVh1c5RbGBFFrxa9cH3LeKO3ap-ovGyJdQTW6rL5',
  );

  const isMe = me?.id === user?.id;

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

      <section className="relative h-[400px] w-full overflow-hidden">
        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqoJKLDnJFZH96UuNRWVfIJwY9ykwIKcYiplNWGjDRWDqnZRbd-aAmLFfL78554VNZ9JCsq4oagm9roa32lrjeUMuKp6peV_iS1WxPv3o1a5Vk8FfRroGGoUIg0S7sS4V_CLk1VhbpK3nT7KwWsRDcMHuFLkaD-O1g-sNXQPrOAeUkdF5QulOu-96Y6IDqg9J22scpaXwwUZpBK5bYygjGYrcwZqHeS1kNWyChfYdj_ZV7ti-63prCynG0GPGvwdA8I1LaYRHAactN" alt="Kiln Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-transparent"></div>
        <div className="absolute top-8 left-8">
           <button onClick={() => router.back()} className="flex items-center gap-2 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold transition-all">
             <span className="material-symbols-outlined">arrow_back</span> Quay lại
           </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
            <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative">
              <img className="w-full h-full object-cover" src={userAvatar} alt={user?.profile?.display_name} />
            </div>
            {user?.products && user.products.length > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-[#52652a] p-3 rounded-2xl shadow-xl border-4 border-white">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            )}
          </motion.div>

          <div className="flex-1 pb-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black tracking-tight text-[#1a1c1c]">
                  {user?.profile?.display_name}
                </motion.h1>
                <div className="flex items-center gap-3 mt-3">
                   <p className="text-[#52652a] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full bg-[#52652a]"></span>
                     {user?.profile?.village || 'Di sản Việt Nam'}
                   </p>
                   <span className="text-zinc-300">•</span>
                   <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                     Tham gia: {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
                   </p>
                </div>
              </div>
              <div className="flex gap-4">
                {!isMe ? (
                  <button 
                    disabled={followLoading}
                    onClick={handleToggleFollow}
                    className={`px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl transition-all hover:scale-[0.98] ${
                      isFollowing 
                        ? 'bg-white text-[#c84b31] border-2 border-[#c84b31]/20 shadow-[#c84b31]/5' 
                        : 'bg-[#c84b31] text-white shadow-[#c84b31]/20'
                    }`}
                  >
                    {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Đang theo dõi' : 'Theo dõi')}
                  </button>
                ) : (
                  <button onClick={() => router.push('/ho-so')} className="px-10 py-4 bg-[#1a1c1c] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl">
                    Hồ sơ của tôi
                  </button>
                )}
                <button className="p-4 bg-white text-zinc-800 rounded-2xl shadow-lg border border-black/5 hover:bg-zinc-50 transition-colors">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-[0_20px_40px_-12px_rgba(26,28,28,0.06)] border border-black/[0.03]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-6 flex items-center gap-4">
               Hành trình Nghệ thuật <span className="flex-1 h-px bg-zinc-100"></span>
            </h3>
            <p className="text-2xl font-medium leading-relaxed text-zinc-700">
              {user?.profile?.bio || 'Chưa có câu chuyện nào được chia sẻ.'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#c84b31]/5 p-12 rounded-[3rem] border border-[#c84b31]/10 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-y-10">
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?.reputationScore || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Uy tín</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?._count?.products || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Tác phẩm</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">0</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Đánh giá</span>
              </div>
              <div className="space-y-1">
                <span className="block text-4xl font-black text-[#c84b31]">{user?._count?.followers || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c84b31]/50">Người theo dõi</span>
              </div>
            </div>
          </motion.div>
        </div>

        {user?.products && user.products.length > 0 && (
          <div className="mt-24 pb-24">
            <div className="flex gap-12 border-b border-zinc-100 px-2 mb-12">
              <button className="pb-6 border-b-4 border-[#c84b31] text-[#1a1c1c] font-black uppercase tracking-[0.2em] text-xs">Phòng trưng bày</button>
            </div>

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
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="bg-[#1a1c1c] rounded-t-[3rem] py-20 px-12 mt-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h4 className="text-white text-xl font-black tracking-tight">Heritage Hearth</h4>
               <p className="text-zinc-500 text-sm mt-2">© 2024 Làng Nghề Platform. Crafted with soul.</p>
            </div>
         </div>
      </footer>
    </main>
  );
}
