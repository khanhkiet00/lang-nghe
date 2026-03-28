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
    <main className="min-h-screen bg-[#09090B] text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-zinc-700"
                />
              ) : (
                <div className="w-30 h-30 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-zinc-300">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                {profile.isVerified && (
                  <span className="bg-violet-600 text-white text-sm px-2 py-1 rounded-full">
                    ✓ Đã xác thực
                  </span>
                )}
              </div>

              {profile.expertise && (
                <p className="text-violet-400 font-medium mb-2">{profile.expertise}</p>
              )}

              {profile.location && (
                <p className="text-zinc-400 mb-4">📍 {profile.location}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>⭐ Điểm uy tín: {profile.user.reputationScore}</span>
                <span>🛠️ Tham gia: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {profile.description && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Giới thiệu</h2>
            <p className="text-zinc-200 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Liên hệ</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">📧</span>
              <span className="text-zinc-200">{profile.user.email}</span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">📍</span>
                <span className="text-zinc-200">{profile.location}</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button className="bg-violet-600 hover:bg-violet-500 text-white rounded-md px-6 py-2 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900">
              Liên hệ với nghệ nhân
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}