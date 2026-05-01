import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveImageUrl } from '@/lib/images';

type Product = {
  id: string;
  title: string;
  slug: string;
  price_retail: number;
  description?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  images: { id: string; url: string }[];
};

interface ArtisanProfile {
  id: string;
  fullName: string;
  slug: string;
  description?: string | null;
  expertise?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    phone?: string | null;
    reputationScore: number;
    reviewSummary?: {
      total: number;
      averageRating: number;
    };
    products: Product[];
  };
}

async function getArtisanProfile(slug: string): Promise<ArtisanProfile | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artisans/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch artisan profile:', error);
    return null;
  }
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const profile = await getArtisanProfile(params.slug);

  if (!profile) {
    return {
      title: 'Nghệ nhân không tìm thấy | Làng Nghề',
      description: 'Nghệ nhân này không tồn tại trên nền tảng Làng Nghề.',
    };
  }

  return {
    title: `${profile.fullName} - Nghệ nhân ${profile.expertise || 'Làng Nghề'}`,
    description:
      profile.description ||
      `Xem hồ sơ và sản phẩm của nghệ nhân ${profile.fullName} trên Làng Nghề.`,
    openGraph: {
      title: `${profile.fullName} - Nghệ nhân ${profile.expertise || 'Làng Nghề'}`,
      description:
        profile.description || `Xem hồ sơ của nghệ nhân ${profile.fullName}.`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl, alt: profile.fullName }] : [],
    },
  };
}

export default async function ArtisanProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getArtisanProfile(params.slug);

  if (!profile) {
    notFound();
  }

  const products = profile.user.products || [];
  const avatarUrl = resolveImageUrl(
    profile.avatarUrl,
    'https://images.unsplash.com/photo-1603321544554-f416a9a11fcf?q=80&w=900&auto=format&fit=crop',
  );

  return (
    <main className="min-h-screen bg-[#F9F9F7] text-[#1A1C1C]">
      <section className="relative overflow-hidden bg-[#1A1C1C] text-white">
        <div className="absolute inset-0 opacity-30">
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1C1C] via-[#1A1C1C]/80 to-[#1A1C1C]/30" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
          <div className="md:col-span-8">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-white">
              Làng Nghề
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <span className="rounded-full bg-[#D4ECA2] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#4A5D23]">
                  Đã xác thực
                </span>
              )}
            </div>

            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/75">
              {profile.description ||
                'Nghệ nhân đang hoàn thiện câu chuyện cửa hàng và hành trình làm nghề.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {profile.expertise && (
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold">
                  {profile.expertise}
                </span>
              )}
              {profile.location && (
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold">
                  {profile.location}
                </span>
              )}
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold">
                Uy tín {profile.user.reputationScore.toFixed(1).replace('.0', '')}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold">
                {profile.user.reviewSummary?.total || 0} đánh giá
              </span>
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/10">
                <img
                  src={avatarUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-5 space-y-3 text-sm text-white/75">
                <p>
                  <span className="font-black text-white">Email:</span>{' '}
                  {profile.user.email}
                </p>
                {profile.user.phone && (
                  <p>
                    <span className="font-black text-white">Điện thoại:</span>{' '}
                    {profile.user.phone}
                  </p>
                )}
                <p>
                  <span className="font-black text-white">Tham gia:</span>{' '}
                  {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C84B31]">
              Gian hàng
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Tác Phẩm Đang Trưng Bày
            </h2>
          </div>
          <p className="text-sm font-bold text-[#58413C]">
            {products.length} sản phẩm công khai
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C84B31]/20 bg-white p-12 text-center">
            <p className="text-sm font-bold text-[#58413C]">
              Nghệ nhân chưa có sản phẩm công khai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = resolveImageUrl(
                product.images?.[0]?.url,
                'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=800&auto=format&fit=crop',
              );

              return (
                <Link
                  key={product.id}
                  href={`/san-pham/${product.slug || product.id}`}
                  className="group rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-4">
                    {product.category?.name && (
                      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#4A5D23]/70">
                        {product.category.name}
                      </p>
                    )}
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 group-hover:text-[#C84B31]">
                      {product.title}
                    </h3>
                    <p className="mt-3 text-lg font-black text-[#C84B31]">
                      {formatVnd(product.price_retail)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
