import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveImageUrl } from '@/lib/images';
import { AddToCartPanel } from '@/components/AddToCartPanel';
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/ui/Navbar';
import { ReviewList } from '@/components/ReviewList';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type ProductDetail = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price_retail: number;
  price_wholesale?: number;
  quantity: number;
  material?: string | null;
  origin?: string | null;
  processingTime?: number | null;
  isCustomizable?: boolean;
  isOneOfAKind?: boolean;
  category?: {
    name: string;
    slug: string;
  } | null;
  images: { id: string; url: string }[];
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
  artisan: {
    id: string;
    reputationScore: number;
    _count?: {
      followers?: number;
    };
    artisanProfile?: {
      fullName?: string | null;
      slug?: string | null;
      avatarUrl?: string | null;
      description?: string | null;
      expertise?: string | null;
      location?: string | null;
    } | null;
    profile?: {
      display_name?: string | null;
      slug?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
      village?: string | null;
    } | null;
  };
};

type ReviewResponse = {
  data?: {
    items?: Array<{
      id: string;
      comment?: string | null;
      createdAt: string;
      rating: number;
      images?: string[] | null;
      reviewer?: {
        profile?: {
          display_name?: string | null;
        } | null;
      } | null;
    }>;
  };
};

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, {
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getProducts(): Promise<ProductDetail[]> {
  try {
    const res = await fetch(`${API_BASE}/products?page=1&limit=4`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getReviews(productId: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as ReviewResponse;
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Sản phẩm không tìm thấy | Làng Nghề',
    };
  }

  return {
    title: `${product.title} | Làng Nghề`,
    description:
      product.description ||
      `Xem ${product.title} từ nghệ nhân trên nền tảng Làng Nghề.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const [reviews, products] = await Promise.all([
    getReviews(product.id),
    getProducts(),
  ]);
  const recommendations = products
    .filter((item) => item.id !== product.id)
    .slice(0, 4);
  const artisanName =
    product.artisan?.artisanProfile?.fullName ||
    product.artisan?.profile?.display_name ||
    'Nghệ nhân làng nghề';
  const artisanProfileSlug = product.artisan?.artisanProfile?.slug;
  const publicProfileSlug = product.artisan?.profile?.slug;
  const artisanHref = publicProfileSlug
    ? `/ho-so/${publicProfileSlug}`
    : artisanProfileSlug
      ? `/nghe-nhan/${artisanProfileSlug}`
      : '#';
  const artisanAvatar = resolveImageUrl(
    product.artisan?.artisanProfile?.avatarUrl ||
      product.artisan?.profile?.avatar_url,
    'https://images.unsplash.com/photo-1559548331-f9cb98001426?q=80&w=300&auto=format&fit=crop',
  );
  const artisanMeta =
    product.artisan?.profile?.village ||
    product.artisan?.artisanProfile?.location ||
    product.artisan?.artisanProfile?.expertise ||
    `${product.artisan?._count?.followers || 0} người theo dõi`;
  const artisanStory =
    product.artisan?.artisanProfile?.description ||
    product.artisan?.profile?.bio ||
    `${artisanName} đang xây dựng câu chuyện xưởng nghề, nơi mỗi sản phẩm được tạo ra từ kinh nghiệm, nhịp tay và sự tôn trọng chất liệu truyền thống.`;
  const mainImage = resolveImageUrl(
    product.images?.[0]?.url,
    'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=1200&auto=format&fit=crop',
  );
  const galleryImages = product.images.length > 0 ? product.images : [{ id: 'fallback', url: mainImage }];
  const rating = product.reviewSummary?.averageRating ?? 0;
  const reviewCount = product.reviewSummary?.total ?? 0;

  return (
    <main className="min-h-screen bg-[#F9F9F7] pb-20 text-[#1A1C1C]">
      <Navbar showSearch={false} activePage="none" />

      <div className="mx-auto max-w-[1440px] px-6 pt-28 md:px-8">

        <section className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="group aspect-[4/5] overflow-hidden rounded-2xl bg-[#F3F3F3]">
              <img
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={mainImage}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div
                  key={image.id}
                  className={`aspect-square overflow-hidden rounded-xl bg-[#EEEEEE] transition-all hover:opacity-80 ${
                    index === 0 ? 'ring-2 ring-[#A6331B]' : ''
                  }`}
                >
                  <img
                    alt={`${product.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                    src={resolveImageUrl(image.url, mainImage)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-8">
            <div className="rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_-28px_rgba(26,28,28,0.28)] ring-1 ring-black/[0.03] md:p-9">
              <span className="inline-flex rounded-full bg-[#D4ECA2] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#576B2F]">
                {product.origin || product.category?.name || 'Di sản thủ công'}
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-[#1A1C1C] md:text-6xl">
                {product.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="text-3xl font-black tracking-tight text-[#A6331B]">
                  {formatVnd(product.price_retail)}
                </span>
                <div className="h-6 w-px bg-[#E0BFB9]/40" />
                <div className="flex items-center gap-1.5 rounded-full bg-[#F9F9F7] px-4 py-2">
                  <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold">
                    {reviewCount > 0 ? rating.toFixed(1).replace('.0', '') : 'Mới'}
                  </span>
                  <span className="text-sm text-[#58413C]">
                    ({reviewCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={artisanHref}
              className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#D4ECA2]">
                <img alt={artisanName} className="h-full w-full object-cover" src={artisanAvatar} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#58413C]/55">Nghệ nhân thực hiện</p>
                <p className="truncate text-lg font-black text-[#1A1C1C] transition-colors group-hover:text-[#A6331B]">{artisanName}</p>
                <p className="mt-0.5 truncate text-xs font-bold text-[#52652A]">{artisanMeta}</p>
              </div>
              <span className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-[#58413C] transition-all group-hover:translate-x-1 group-hover:bg-[#A6331B] group-hover:text-white">chevron_right</span>
            </Link>

            <div className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#58413C]">
                Câu chuyện sản phẩm
              </h2>
              <p className="whitespace-pre-line text-lg font-light italic leading-relaxed text-[#58413C]">
                {product.description ||
                  'Mỗi tác phẩm là kết quả của chất liệu, thời gian và đôi tay người làm nghề. Nghệ nhân đang hoàn thiện câu chuyện chi tiết cho sản phẩm này.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/60">Chất liệu</p>
                <p className="mt-2 font-black">{product.material || 'Đang cập nhật'}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/60">Tồn kho</p>
                <p className="mt-2 font-black">{product.quantity} sản phẩm</p>
              </div>
            </div>

            <AddToCartPanel
              item={{
                id: product.id,
                slug: product.slug || product.id,
                title: product.title,
                price: product.price_retail,
                imageUrl: product.images?.[0]?.url,
                categoryName: product.category?.name,
                artisanId: product.artisan?.id || '',
                artisanName,
                stock: product.quantity,
              }}
            />

            <div className="grid grid-cols-3 gap-4 py-6">
              {[
                ['verified_user', product.isOneOfAKind ? 'Độc bản 100%' : 'Xác thực nghệ nhân'],
                ['local_shipping', product.processingTime ? `${product.processingTime} ngày chế tác` : 'Giao hàng an toàn'],
                ['eco', product.material || 'Vật liệu tự nhiên'],
              ].map(([icon, label]) => (
                <div key={icon} className="flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-3xl text-[#52652A]">{icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-32 space-y-28">
          <div className="flex flex-col items-center gap-16 md:flex-row">
            <div className="w-full md:w-5/12">
              <h2 className="mb-8 text-4xl font-extrabold tracking-tighter">Bàn tay nhào nặn lịch sử</h2>
              <p className="mb-6 text-lg leading-relaxed text-[#58413C]">
                {artisanStory}
              </p>
              {artisanHref !== '#' && (
                <Link
                  href={artisanHref}
                  className="border-b-2 border-[#A6331B]/20 pb-1 text-sm font-bold uppercase tracking-widest text-[#A6331B] transition-all hover:border-[#A6331B]"
                >
                  Tìm hiểu thêm về nghệ nhân
                </Link>
              )}
            </div>
            <div className="w-full md:w-7/12">
              <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-xl">
                <img alt={artisanName} className="h-full w-full object-cover" src={mainImage} />
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="mx-auto max-w-2xl space-y-4 text-center">
              <h2 className="text-4xl font-extrabold tracking-tighter">Dấu hiệu tin cậy</h2>
              <p className="text-[#58413C]">Các tín hiệu thật từ sản phẩm, hồ sơ nghệ nhân và giao dịch trên nền tảng.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                ['01', 'Uy tín cộng đồng', `${(product.artisan?.reputationScore ?? 0).toFixed(1).replace('.0', '')}/5 từ các đánh giá sau đơn hàng.`],
                ['02', 'Nguồn gốc rõ ràng', product.origin || product.category?.name || 'Sản phẩm được gắn với hồ sơ nghệ nhân trên nền tảng.'],
                ['03', 'Mạng lưới theo dõi', `${product.artisan?._count?.followers || 0} người đang theo dõi nghệ nhân này.`],
              ].map(([number, title, body]) => (
                <div key={number} className="space-y-4 rounded-2xl bg-[#F3F3F3] p-8 transition-all hover:shadow-lg">
                  <span className="text-5xl font-black text-[#A6331B]/10">{number}</span>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#58413C]">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <ReviewList
            reviews={reviews}
            reviewCount={reviewCount}
            title="Đánh giá sản phẩm"
            emptyMessage="Sản phẩm này chưa có đánh giá sau giao dịch."
          />
        </section>

        {recommendations.length > 0 && (
          <section className="mt-28 rounded-[2.5rem] bg-white px-5 py-10 shadow-[0_24px_70px_-45px_rgba(26,28,28,0.5)] ring-1 ring-black/[0.03] md:px-8">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#52652A]">
                  Gợi ý dành cho bạn
                </p>
                <h2 className="mt-2 text-4xl font-black tracking-tight">Có Thể Bạn Sẽ Thích</h2>
                <p className="mt-2 italic text-zinc-400">Những tuyệt tác khác từ mạng lưới nghệ nhân.</p>
              </div>
              <Link className="rounded-full bg-[#F9F9F7] px-5 py-3 text-sm font-black text-[#A6331B] transition-colors hover:bg-[#A6331B] hover:text-white" href="/">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price_retail}
                  imageUrl={item.images?.[0]?.url}
                  artisanName="Làng Nghề"
                  categoryName={item.category?.name}
                  slug={item.slug || item.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
