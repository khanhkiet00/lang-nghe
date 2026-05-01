'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { resolveImageUrl } from '@/lib/images';
import { CartNavIcon } from '@/components/CartNavIcon';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type HeroSlide = {
  village: string;
  quote: string;
  image: string;
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductImage = {
  id: string;
  url: string;
};

type ProductItem = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  price_retail: number;
  category: ProductCategory;
  images: ProductImage[];
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
  artisan?: {
    id: string;
    reputationScore?: number;
    _count?: {
      followers?: number;
    };
    artisanProfile?: {
      fullName?: string | null;
      slug?: string | null;
      avatarUrl?: string | null;
    } | null;
    profile?: {
      display_name?: string | null;
      slug?: string | null;
      avatar_url?: string | null;
    } | null;
  };
};

const heroSlides: HeroSlide[] = [
  {
    village: 'Làng Gốm Bát Tràng',
    quote: 'Bảy thế kỷ di sản, kết tinh trong từng nhịp thở của đất.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzDiGegmUs46GdpAk6ZjkmA5S4MebA-iVR-r7IzM5VExUp6tuIWO8yvX7sSCLAV4TSpyvdxqMpNlJjopYlORHR1b4miZxSjCvM9k_k-0_6sYpv6ZlDZFDdqU9jT7pOZl8lJx0tDnRs_bYOeMoVYEXRliPkPG7M2et_P-PLH7NhZoqqoHZIFlu4d_3Y0lSGzrHK9AuWhGHQmAzSl_3fTX1LmCGn1cvjNGVkUObbAUEUORHTRDJVqXdEizCV4buCW8N0f3jwI2O4paQG',
  },
  {
    village: 'Mây Tre Đan Phú Vinh',
    quote: 'Sự mềm mại của mây, nét cứng cáp của tre tạo nên tuyệt tác.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGpjmxOSKP99JlCyJ8X5HjSXIZbhfnzo1YQaHLBW8eWG8Lg-3FSQj1dZoUJm2Fx-d_zgvgaBxDameAcuhmkpT9N77Jf7F_wRriF3Hf8cPz3ZLYD4Chf4tfRlHF11nqThK4Mla7d2ruzsYHx2uXrbzCrmfYvnfkj4rQoJGP4gwPNUC7REsz5-SQhOt7GCSa3m3Ll9GmmInqSFlFgHf3y6TWxOj-IoggADf43E9wNj9DfyuFxU7IOQP0yNpX7DvBca4Z34_ywxZL_FLM',
  },
  {
    village: 'Lụa Vạn Phúc',
    quote: 'Mượt mà như làn nước, rạng rỡ tựa ánh bình minh.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEJejclLL0AmOJbEaukSESmf4j6rzEa01IiJiL_gIQchSRF1Z0T7xf7D-CAOBQcqLl8SF9RI7GwcotjI7VgUSRS5AdbieGndvZCoMDwh5euzUQN8YCwX1iqnUGMDvGvHE8MmmAmiciWqbir91Pnf1-DumJJVSrn39HRQrHN24b9OuWtz2cCHOi0BgNfYMufDXoybaYkXW0ABVUbRyYdfNJt-E8k-DsdTC_8C25e6kvvchmkJSSYvOQRm0Rfrl1IAog77CajwhyIH7m',
  },
];

const fallbackImage =
  'https://images.unsplash.com/photo-1603321544554-f416a9a11fcf?q=80&w=1200&auto=format&fit=crop';

function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadProducts = useCallback(async (pageNum: number, isAppend: boolean = false) => {
    if (pageNum === 1) {
      setLoadingProducts(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const limit = 8;
      const response = await fetch(`${API_BASE}/products?page=${pageNum}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Không thể tải danh sách sản phẩm');
      }

      const json = (await response.json()) as {
        data?: { items?: ProductItem[], meta?: { totalItems: number } };
      };

      const items = json.data?.items ?? [];
      setProductError('');
      
      if (isAppend) {
        setAllProducts(prev => [...prev, ...items]);
      } else {
        setAllProducts(items);
      }

      // Simple check for hasMore
      if (items.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProductError('Chưa kết nối được dữ liệu sản phẩm thật. Vui lòng kiểm tra backend.');
      if (!isAppend) {
        setAllProducts([]);
      }
    } finally {
      setLoadingProducts(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadProducts(1);
  }, [loadProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadProducts(nextPage, true);
  };

  useEffect(() => {
    const token = localStorage.getItem('langnghe_access_token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          setUserName(payload.email.split('@')[0]);
        }
        if (payload.roles) {
          setIsArtisan(payload.roles.includes('artisan'));
        }
      } catch (e) { }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem('langnghe_access_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Keep client logout even if server call fails.
    } finally {
      localStorage.removeItem('langnghe_access_token');
      setIsLoggedIn(false);
      setAuthMenuOpen(false);
    }
  }

  const categories = Array.from(
    new Map(
      allProducts
        .map((product) => product.category)
        .filter(Boolean)
        .map((category) => [category.slug, category]),
    ).values(),
  );

  const visibleProducts = allProducts.filter((product) => {
    const categoryMatch =
      activeCategorySlug === 'all' || product.category.slug === activeCategorySlug;
    const searchMatch =
      searchTerm.trim().length === 0 ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
  const featuredProducts = [...allProducts]
    .sort((a, b) => {
      const scoreB =
        (b.reviewSummary?.averageRating ?? 0) * 100 +
        (b.reviewSummary?.total ?? 0) * 5 +
        (b.artisan?._count?.followers ?? 0);
      const scoreA =
        (a.reviewSummary?.averageRating ?? 0) * 100 +
        (a.reviewSummary?.total ?? 0) * 5 +
        (a.artisan?._count?.followers ?? 0);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  const getArtisanName = (product: ProductItem) =>
    product.artisan?.artisanProfile?.fullName ||
    product.artisan?.profile?.display_name ||
    'Nghệ nhân làng nghề';

  return (
    <div className="bg-[#F9F9F7] text-[#1A1C1C]">
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
          <div className="shrink-0 text-2xl font-extrabold tracking-tighter text-[#C84B31]">
            Làng Nghề
          </div>

          <div className="mx-12 hidden max-w-md flex-1 md:flex">
            <div className="group relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#C84B31]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm tinh hoa làng nghề..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-full border-none bg-[#F2F4F2] py-2.5 pl-12 pr-4 text-sm text-zinc-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#C84B31]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="mr-4 hidden items-center gap-8 lg:flex">
              <a className="font-bold text-[#C84B31]" href="/">
                Trang chủ
              </a>
              <a className="font-medium text-zinc-600 transition-colors hover:text-[#C84B31]" href="#">
                Nghệ nhân
              </a>
            </div>

            <CartNavIcon />

            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth?mode=login"
                  className="rounded-full border border-[#C84B31]/30 px-4 py-2 text-sm font-semibold text-[#C84B31] transition-all hover:border-[#C84B31]"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="rounded-full bg-[#C84B31] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="group relative flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-600">
                  {userName}
                </span>
                <button
                  onClick={() => setAuthMenuOpen((prev) => !prev)}
                  className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-[#C84B31]/10 transition-all hover:border-[#C84B31]"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5LVvXgxx-E-_57gSL5yTTHo_76HhRKKKX0zvbt3BVTPVJ1MjIAA9uFcNBjB-jgeuX4jDcr8IPeK6Cnu-_xv26QGMYOEP6BC0FLFYTRNLGxMe6gQqdh3sMjLdOooevoZNZR6A6i-z4EAapm6gP-9bb8sLyLsebdzA9jFH7Pmsya64g91i6l-Qj1dQ-9K925hZ6yMeqQKhdobUcUtJUpbaLz4Z_eheMnOsw-FxAVh1c5RbGBFFrxa9cH3LeKO3ap-ovGyJdQTW6rL5"
                    alt="Hồ sơ"
                    className="h-full w-full object-cover"
                  />
                </button>

                <div
                  className={`absolute right-0 top-12 flex w-52 flex-col gap-1 rounded-xl border border-black/5 bg-white p-2 shadow-xl transition-all z-50 ${authMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                    }`}
                >
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Tài khoản
                  </p>
                  <Link href="/ho-so" className="rounded-lg px-3 py-2 text-sm hover:bg-[#F2F4F2]">
                    Hồ sơ của tôi
                  </Link>
                  <Link href="/ho-so/thong-ke" className="rounded-lg px-3 py-2 text-sm text-[#C84B31] font-medium hover:bg-[#F2F4F2]">
                    Thống kê chi tiêu
                  </Link>
                  {isArtisan ? (
                    <Link href="/nghe-nhan" className="rounded-lg px-3 py-2 text-sm text-[#4A5D23] font-semibold hover:bg-[#F2F4F2]">
                      Quản lý xưởng
                    </Link>
                  ) : (
                    <Link href="/nghe-nhan/dang-ky" className="rounded-lg px-3 py-2 text-sm text-[#C84B31] font-semibold hover:bg-[#F2F4F2]">
                      ★ Trở thành Nghệ nhân
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-600 hover:bg-[#F2F4F2]"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:px-8">
        <section className="mb-24 grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12">
          <div className="relative h-[380px] md:col-span-7 md:h-[500px]">
            <div className="relative h-full overflow-hidden rounded-2xl bg-zinc-200 shadow-2xl">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.village}
                  src={slide.image}
                  alt={slide.village}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                />
              ))}
            </div>

            <div className="absolute -bottom-6 right-4 max-w-xs rounded-2xl bg-[#D4ECA2] px-6 py-5 shadow-lg md:right-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A5D23]/70">
                Nguồn gốc di sản
              </p>
              <p className="mt-1 text-xl font-bold text-[#4A5D23]">{heroSlides[activeSlide].village}</p>
              <p className="mt-2 text-sm italic text-[#4A5D23]/90">
                &ldquo;{heroSlides[activeSlide].quote}&rdquo;
              </p>
            </div>

            <div className="absolute bottom-5 left-6 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#C84B31]' : 'w-2 bg-white/60'
                    }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A5D23]">Cảm hứng từ quá khứ</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1A1C1C] md:text-6xl">
              Thổi <span className="italic text-[#C84B31]">Hồn</span> Vào Đất Đá.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-500">
              Khám phá không gian trưng bày các tác phẩm thủ công đích thực, nơi di sản được kể bằng ngôn ngữ của nghệ thuật hiện đại.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-[#C84B31] px-8 py-4 font-bold text-white shadow-lg shadow-[#C84B31]/20 transition-all hover:opacity-90">
                Khám Phá Ngay
              </button>
              <button className="px-8 py-4 font-bold text-[#C84B31] underline-offset-8 hover:underline">
                Về Chúng Tôi
              </button>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-extrabold">Tạo Tác Xu Hướng</h2>
              <p className="mt-2 italic text-zinc-400">
                Kết tinh từ tâm huyết của các bậc thầy lành nghề.
              </p>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C84B31]/20 bg-white p-12 text-center text-sm font-bold text-zinc-500">
              Chưa có sản phẩm thật để xếp xu hướng.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {featuredProducts[0] && (
                <Link
                  href={`/san-pham/${featuredProducts[0].slug || featuredProducts[0].id}`}
                  className="group relative md:col-span-2 md:row-span-2"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:shadow-2xl">
                    <div className="relative aspect-[4/5] flex-grow overflow-hidden md:aspect-auto">
                      <img
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={resolveImageUrl(featuredProducts[0].images?.[0]?.url, fallbackImage)}
                        alt={featuredProducts[0].title}
                      />
                      <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#C84B31] shadow-sm backdrop-blur-md">
                        XU HƯỚNG
                      </div>
                    </div>
                    <div className="bg-white p-10">
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <span className="font-black text-amber-500">
                          {featuredProducts[0].reviewSummary?.total
                            ? `★ ${featuredProducts[0].reviewSummary.averageRating.toFixed(1).replace('.0', '')}`
                            : 'Chưa có đánh giá'}
                        </span>
                        <span className="text-xs text-zinc-400">
                          ({featuredProducts[0].reviewSummary?.total || 0} đánh giá thật)
                        </span>
                      </div>
                      <h3 className="mb-2 text-3xl font-bold">{featuredProducts[0].title}</h3>
                      <p className="mb-6 italic text-zinc-500">
                        {getArtisanName(featuredProducts[0])} • {featuredProducts[0].category?.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-[#C84B31]">
                          {formatVnd(featuredProducts[0].price_retail)}
                        </span>
                        <span className="rounded-xl bg-[#C84B31] px-8 py-3 font-bold text-white transition-colors group-hover:bg-[#9f3d28]">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {featuredProducts.slice(1).map((item) => (
                <Link
                  key={item.id}
                  href={`/san-pham/${item.slug || item.id}`}
                  className="group rounded-2xl bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#F2F4F2]">
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={resolveImageUrl(item.images?.[0]?.url, fallbackImage)}
                      alt={item.title}
                    />
                  </div>
                  <div className="pb-2 pt-5">
                    <div className="mb-2 text-xs font-black text-amber-500">
                      {item.reviewSummary?.total
                        ? `★ ${item.reviewSummary.averageRating.toFixed(1).replace('.0', '')} (${item.reviewSummary.total})`
                        : 'Chưa có đánh giá'}
                    </div>
                    <h4 className="line-clamp-2 min-h-[56px] text-lg font-bold">{item.title}</h4>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xl font-extrabold text-[#C84B31]">
                        {formatVnd(item.price_retail)}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1C1C] text-white transition-colors group-hover:bg-[#C84B31]">
                        +
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16 sticky top-[72px] z-40">
          <div className="hide-scrollbar overflow-x-auto rounded-full bg-[#F2F4F2] px-8 py-4 shadow-sm">
            <div className="flex items-center gap-8 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => setActiveCategorySlug('all')}
                className={`pb-1 ${activeCategorySlug === 'all'
                    ? 'border-b-2 border-[#C84B31] font-bold text-[#C84B31]'
                    : 'text-zinc-500 hover:text-[#C84B31]'
                  }`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setActiveCategorySlug(category.slug)}
                  className={`pb-1 ${activeCategorySlug === category.slug
                      ? 'border-b-2 border-[#C84B31] font-bold text-[#C84B31]'
                      : 'text-zinc-500 hover:text-[#C84B31]'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight">Khám Phá Di Sản</h2>
          <p className="mt-2 text-zinc-400">Duyệt theo bộ sưu tập làng nghề đích thực.</p>

          {loadingProducts && (
            <p className="mt-6 text-zinc-500">Đang tải dữ liệu sản phẩm...</p>
          )}

          {productError && (
            <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {productError}
            </p>
          )}

          {!loadingProducts && visibleProducts.length === 0 && (
            <p className="mt-6 text-zinc-500">
              Không có sản phẩm phù hợp với bộ lọc hiện tại.
            </p>
          )}

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price_retail}
                imageUrl={product.images?.[0]?.url}
                artisanName={getArtisanName(product)}
                categoryName={product.category?.name}
                slug={product.slug || product.id}
                averageRating={product.reviewSummary?.averageRating}
                reviewCount={product.reviewSummary?.total}
                followerCount={product.artisan?._count?.followers}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group flex items-center gap-2 rounded-full border-2 border-[#C84B31]/20 px-12 py-4 font-bold text-[#C84B31] transition-all duration-300 hover:bg-[#C84B31] hover:text-white disabled:opacity-50"
              >
                <span>{isLoadingMore ? 'Đang tải tinh hoa...' : 'Xem Thêm Tinh Hoa'}</span>
                {!isLoadingMore && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 transition-transform group-hover:translate-y-1"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="rounded-t-[3rem] bg-[#1A1C1C] px-8 py-20 text-zinc-400">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-2xl font-bold tracking-tight text-white">Làng Nghề</p>
            <p className="mt-5 max-w-sm leading-relaxed">
              Nơi hội tụ những giá trị thủ công nguyên bản. Mỗi tạo tác là một mảnh linh hồn của văn hóa Việt Nam.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Hành trình</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-[#C84B31]">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#C84B31]">
                  Danh bạ Nghệ nhân
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Liên hệ</p>
            <p className="mt-5 text-sm leading-loose">
              Hà Nội, Việt Nam
              <br />
              contact@heritagehearth.vn
              <br />
              (+84) 900 000 000
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
