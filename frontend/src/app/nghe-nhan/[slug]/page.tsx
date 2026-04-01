import { notFound } from 'next/navigation';
import Image from 'next/image';

interface ArtisanProfile {
  id: string;
  fullName: string;
  slug: string;
  description?: string;
  expertise?: string;
  location?: string;
  avatarUrl?: string;
  cccdUrl?: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    reputationScore: number;
  };
}

async function getArtisanProfile(slug: string): Promise<ArtisanProfile | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artisans/${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
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
    description: profile.description || `Xem hồ sơ của nghệ nhân ${profile.fullName} trên Làng Nghề. ${profile.expertise ? `Chuyên: ${profile.expertise}.` : ''} ${profile.location ? `Địa điểm: ${profile.location}.` : ''}`,
    openGraph: {
      title: `${profile.fullName} - Nghệ nhân ${profile.expertise || 'Làng Nghề'}`,
      description: profile.description || `Xem hồ sơ của nghệ nhân ${profile.fullName} trên Làng Nghề.`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl, alt: profile.fullName }] : [],
    },
  };
}

export default async function ArtisanProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getArtisanProfile(params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_25%,rgba(99,102,241,0.08),transparent_42%),radial-gradient(circle_at_88%_10%,rgba(56,189,248,0.08),transparent_35%)]" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] rounded-full border-2 border-zinc-700 object-cover"
                />
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-800">
                  <span className="text-2xl font-semibold text-zinc-300">{profile.fullName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Nghe Nhan Profile</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">{profile.fullName}</h1>
                {profile.isVerified && (
                  <span className="rounded-full border border-violet-500/60 bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300">
                    Da xac thuc
                  </span>
                )}
              </div>

              {profile.expertise && <p className="mt-2 text-base text-zinc-300">{profile.expertise}</p>}

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-400">
                <span className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5">
                  Diem uy tin: {profile.user.reputationScore}
                </span>
                <span className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5">
                  Tham gia: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                </span>
                {profile.location && (
                  <span className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5">Khu vuc: {profile.location}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-100">Gioi thieu</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">
              {profile.description || 'Nghe nhan chua cap nhat phan gioi thieu.'}
            </p>
          </article>

          <aside className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-zinc-100">Lien he</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300">Email: {profile.user.email}</p>
              {profile.location && (
                <p className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300">Dia diem: {profile.location}</p>
              )}
            </div>

            <button className="mt-5 w-full rounded-md bg-violet-600 px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900">
              Lien he voi nghe nhan
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}