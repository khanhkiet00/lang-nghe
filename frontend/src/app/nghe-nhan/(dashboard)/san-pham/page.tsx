'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { motion } from 'framer-motion';
import Pagination from '@/components/ui/Pagination';
import { resolveImageUrl } from '@/lib/images';

interface Product {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  price_retail: number;
  quantity: number;
  images: { url: string }[];
  isActive: boolean;
  version: number;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = useCallback(async (page: number, search: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsFetching(true);

    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: search
      });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/mine?${query.toString()}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('langnghe_access_token'),
        }
      });
      const json = await res.json();
      const items = json.data?.items || json.data || [];
      setProducts(items);
      setTotalCount(json.data?.pagination?.total || items.length);
      setTotalPages(json.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      // On first search after load, don't show full page spinner
      fetchProducts(1, searchTerm, false); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchProducts]);

  // Effect for page change
  useEffect(() => {
    if (currentPage !== 1) {
       fetchProducts(currentPage, searchTerm, false);
    }
  }, [currentPage, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts(1, '', true);
  }, []); // Only on mount

  const handleToggleActive = async (product: Product) => {
// ... existing toggle logic ...
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('langnghe_access_token'),
        },
        body: JSON.stringify({
          isActive: !product.isActive,
          version: product.version
        }),
      });

      if (res.ok) {
        toast.success(`Đã ${product.isActive ? 'ẩn' : 'hiện'} tác phẩm thành công`);
        fetchProducts(currentPage, searchTerm);
      } else {
        const err = await res.json();
        toast.error('Lỗi: ' + (err.message || 'Không thể cập nhật trạng thái'));
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    }
  };

  const openDeleteModal = (productId: string) => {
    setProductToDelete(productId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('langnghe_access_token'),
        },
      });

      if (res.ok) {
        toast.success('Đã xóa tác phẩm thành công');
        fetchProducts(currentPage, searchTerm);
      } else {
        const err = await res.json();
        toast.error('Lỗi: ' + (err.message || 'Không thể xóa sản phẩm'));
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    }
  };

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
            Kho hàng Tác phẩm
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
            {loading ? '...' : totalCount}
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
              Đang hiển thị
            </span>
            <span className="material-symbols-outlined text-[#52652a] p-2 bg-[#52652a]/5 rounded-lg">
              visibility
            </span>
          </div>
          <div className="text-4xl font-extrabold text-on-surface">
             {loading ? '...' : products.filter(p => p.isActive).length}
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
              placeholder="Tìm kiếm theo tên tác phẩm..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isFetching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className={`overflow-x-auto transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-[#1a1c1c]/5 bg-[#fdfcfb]">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Ảnh</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Tên Sản Phẩm</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">D.Mục</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Giá</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Kho</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c1c]/5 min-h-[400px]">
              {loading ? (
                <tr>
                   <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="w-8 h-8 border-4 border-[#c84b31] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Đang tải di sản...</p>
                   </td>
                 </tr>
              ) : products.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-8 py-20 text-center text-on-surface-variant/40 font-medium italic">
                      Không tìm thấy tác phẩm nào phù hợp.
                   </td>
                 </tr>
              ) : products.map((product, index) => (
                <tr key={product.id} className="hover:bg-[#fdfcfb] transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-on-surface-variant/60">
                    {(currentPage - 1) * 12 + index + 1}
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high border border-[#1a1c1c]/5">
                      <img
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={resolveImageUrl(product.images?.[0]?.url, 'https://via.placeholder.com/150')}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-on-surface text-base">{product.title}</div>
                    <div className="text-[9px] text-on-surface-variant/50 font-medium uppercase tracking-widest mt-1">
                      Slug: {product.slug}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f3f3f3] text-on-surface text-[9px] font-bold uppercase tracking-widest">
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
                      <span className={`text-xs font-medium ${product.quantity <= 5 ? 'text-[#ba1a1a]' : ''}`}>
                        {product.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleActive(product)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        product.isActive 
                          ? 'bg-[#52652a]/10 text-[#52652a] hover:bg-[#52652a]/20' 
                          : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm mr-1.5">
                        {product.isActive ? 'visibility' : 'visibility_off'}
                      </span>
                      {product.isActive ? 'Hiện' : 'Ẩn'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link 
                        href={`/nghe-nhan/san-pham/chinh-sua/${product.id}`}
                        className="p-2.5 text-on-surface-variant/40 hover:text-[#c84b31] hover:bg-[#c84b31]/5 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </Link>
                      <button 
                        onClick={() => openDeleteModal(product.id)}
                        className="p-2.5 text-on-surface-variant/40 hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/5 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDelete}
          title="Xác nhận xóa Tác phẩm?"
          message="Bạn có chắc chắn muốn xóa tác phẩm này? Dữ liệu sẽ được ẩn khỏi tất cả các trang nhưng vẫn được lưu trữ bảo mật trong hệ thống."
          confirmText="Xóa di sản"
          type="danger"
        />
        
        <div className="p-8 flex items-center justify-between border-t border-[#1a1c1c]/5">
          <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">
            Hiển thị {products.length} / {totalCount} tác phẩm
          </span>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
