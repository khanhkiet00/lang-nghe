'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  price_retail: number;
  quantity: number;
  images: { url: string }[];
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/mine`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('langnghe_access_token'),
          }
        });
        const json = await res.json();
        setProducts(json.data?.items || json.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="p-8 md:p-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#c84b31] uppercase mb-3">
            <span>Sản phẩm</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-on-surface-variant/40">Tất cả sản phẩm</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">
            Danh sách Sản phẩm
          </h1>
        </div>
        <Link
          href="/nghe-nhan/san-pham/them"
          className="inline-flex items-center justify-center px-8 py-4 bg-[#c84b31] text-white rounded-xl font-bold tracking-wide shadow-xl shadow-[#c84b31]/20 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-xl mr-2">add</span>
          Đăng sản phẩm mới
        </Link>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1a1c1c]/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Tổng sản phẩm
            </span>
            <span className="material-symbols-outlined text-[#c84b31] p-2 bg-[#c84b31]/5 rounded-lg">
              inventory
            </span>
          </div>
          <div className="text-4xl font-extrabold text-on-surface">
            {loading ? '...' : products.length}
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1a1c1c]/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Sắp hết hàng
            </span>
            <span className="material-symbols-outlined text-[#ba1a1a] p-2 bg-[#ba1a1a]/5 rounded-lg">
              warning
            </span>
          </div>
          <div className="text-4xl font-extrabold text-on-surface">
             {loading ? '...' : products.filter(p => (p.quantity || 0) < 5).length}
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1a1c1c]/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Đang hoạt động
            </span>
            <span className="material-symbols-outlined text-[#52652a] p-2 bg-[#52652a]/5 rounded-lg">
              check_circle
            </span>
          </div>
          <div className="text-4xl font-extrabold text-on-surface">
             {loading ? '...' : products.length}
          </div>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(26,28,28,0.04)] overflow-hidden border border-[#1a1c1c]/5">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-[#c84b31] transition-colors">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3.5 bg-[#f9f9f9] border-none rounded-xl text-sm transition-all focus:ring-2 focus:ring-[#c84b31]/20 outline-none"
              placeholder="Tìm kiếm sản phẩm..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-[#1a1c1c]/5 bg-[#fdfcfb]">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Ảnh</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Tên Sản Phẩm</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Danh Mục</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Giá Bán</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Tồn Kho</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c1c]/5">
              {loading ? (
                 <tr>
                   <td colSpan={6} className="px-8 py-10 text-center text-on-surface-variant/50 italic">
                      Đang tải danh sách tác phẩm...
                   </td>
                 </tr>
              ) : products.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-10 text-center text-on-surface-variant/50 italic">
                      Chưa có sản phẩm nào.
                   </td>
                 </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-[#fdfcfb] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high border border-[#1a1c1c]/5">
                      <img
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={product.images?.[0]?.url 
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${product.images[0].url}` 
                          : 'https://via.placeholder.com/150'}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-on-surface text-base">{product.title}</div>
                    <div className="text-[10px] text-on-surface-variant/50 font-medium uppercase tracking-widest mt-1">
                      Slug: {product.slug}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f3f3f3] text-on-surface text-[10px] font-bold uppercase tracking-widest">
                      {product.category?.name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-on-surface">
                      {product.price_retail.toLocaleString('vi-VN')}₫
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${product.quantity > 5 ? 'bg-[#52652a]' : 'bg-[#ba1a1a]'}`}></div>
                      <span className={`text-sm font-medium ${product.quantity <= 5 ? 'text-[#ba1a1a]' : ''}`}>
                        {product.quantity} bản
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2.5 text-on-surface-variant/40 hover:text-[#c84b31] hover:bg-[#c84b31]/5 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button className="p-2.5 text-on-surface-variant/40 hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/5 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 flex items-center justify-between border-t border-[#1a1c1c]/5">
          <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
            Hiển thị {products.length} tác phẩm
          </span>
        </div>
      </div>
    </main>
  );
}
