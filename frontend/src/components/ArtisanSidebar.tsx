'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ArtisanSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Bảng điều khiển', icon: 'dashboard', href: '/nghe-nhan' },
    { name: 'Kho hàng', icon: 'inventory_2', href: '/nghe-nhan/san-pham' },
    { name: 'Đơn hàng', icon: 'local_shipping', href: '/nghe-nhan/don-hang' },
    { name: 'Thống kê', icon: 'bar_chart', href: '/nghe-nhan/thong-ke' },
    { name: 'Cài đặt', icon: 'settings', href: '/nghe-nhan/settings' },
  ];

  return (
    <aside className="hidden md:flex h-screen w-72 border-r border-[#1a1c1c]/5 bg-[#f5f2ee] flex-col p-6 sticky top-0">
      <div className="font-black text-[#c84b31] text-xl mb-8 tracking-tighter">
        Bát Tràng Studio
      </div>
      
      <div className="flex items-center gap-3 mb-10 p-2">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20">
          <img
            alt="Artisan Studio Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvdr2Qbinh7W6xrpTySUPztETrSuuDaf5bVVU_fqiJQSFNIom1D1fVfrmAbjuNF5MN56gkPDH_TD45e91l5bnLQNx5PbERgsE4f7krN5ymidBJr5zCRj_EFDg204WvApWzlCPD0w5dItBDhSk9lkJGfrBhAo15fzc8Jc6-AdUgdLj13ATPTRqcTN2pFuhWOgVkSiES-50uhey5nUOvI-KxN0ubkurQV4Vz0p_7a_SGxmh38zWWXByoakVpRQ2x2eyR2W-xLblGEykD"
          />
        </div>
        <div>
          <div className="font-bold text-sm text-on-surface">Bát Tràng Studio</div>
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-bold">
            Nghệ nhân ưu tú
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-transform hover:translate-x-1 rounded-xl group ${
                isActive
                  ? 'bg-white text-[#c84b31] shadow-sm'
                  : 'text-[#1a1c1c]/70 hover:bg-black/5'
              }`}
            >
              <span 
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2">
        <Link
          href="/nghe-nhan/san-pham/them"
          className="flex items-center justify-center gap-2 w-full py-4 bg-[#c84b31] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#c84b31]/20 active:scale-95 transition-all mb-4"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Thêm tác phẩm mới
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('langnghe_access_token');
            localStorage.removeItem('langnghe_refresh_token');
            window.location.href = '/auth?mode=login';
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 rounded-xl font-bold transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
