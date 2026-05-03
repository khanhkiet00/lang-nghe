'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category_slug: '',
    price_retail: 0,
    price_wholesale: 0,
    quantity: 0,
    description: '',
    material: '',
    origin: '',
    processingTime: 7,
    isCustomizable: false,
    isOneOfAKind: false,
    images: [] as string[],
    isActive: true,
    version: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await api.get('/categories');
        const catJson = await catRes.json();
        const catData = catJson.data || [];
        setCategories([...catData, { id: 'other', name: 'Khác (Tự nhập...)', slug: 'other' }]);

        // Fetch product details
        const prodRes = await api.get(`/products/${id}`);
        if (!prodRes.ok) throw new Error('Không thể tải thông tin sản phẩm');
        
        const prodJson = await prodRes.json();
        const product = prodJson.data;

        setFormData({
          title: product.title,
          category_slug: product.category?.slug || '',
          price_retail: product.price_retail,
          price_wholesale: product.price_wholesale,
          quantity: product.quantity,
          description: product.description || '',
          material: product.material || '',
          origin: product.origin || '',
          processingTime: product.processingTime || 0,
          isCustomizable: product.isCustomizable,
          isOneOfAKind: product.isOneOfAKind,
          images: product.images?.map((img: any) => img.url) || [],
          isActive: product.isActive,
          version: product.version,
        });
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
        data.append('files', files[i]);
    }
    data.append('folderType', 'products');

    try {
      const res = await api.post('/upload', data);

      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls]
        }));
        toast.success(`Đã tải lên ${files.length} ảnh thành công`);
      } else {
        const err = await res.json();
        toast.error('Lỗi tải ảnh: ' + (err.message || 'Dung lượng file quá lớn'));
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi tải ảnh');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.patch(`/products/${id}`, formData);

      if (res.ok) {
        toast.success('Cập nhật sản phẩm thành công!');
        router.push('/nghe-nhan/san-pham');
      } else {
        const err = await res.json();
        toast.error('Lỗi: ' + (err.message || 'Không thể cập nhật sản phẩm'));
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-4 border-[#c84b31] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Đang tải dữ liệu sản phẩm...</p>
    </div>
  );

  return (
    <main className="min-h-screen">
      <header className="px-8 pt-12 pb-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-tight">
            Chỉnh Sửa Tác Phẩm
          </h2>
          <p className="text-on-surface-variant max-w-md">
            Cập nhật thông tin cho tác phẩm di sản của bạn.
          </p>
        </div>
      </header>

      <section className="px-8 pb-20 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block px-1">Hình ảnh (Tối đa 10 ảnh)</label>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-black/5 bg-white">
                    <img 
                      src={resolveImageUrl(url)} 
                      alt={`Preview ${idx}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}

                {formData.images.length < 10 && (
                  <div className={`group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center p-4 transition-all hover:bg-surface-container-low hover:border-[#c84b31]/40 ${uploading ? 'opacity-50' : ''}`}>
                    <span className="material-symbols-outlined text-3xl text-outline mb-2 group-hover:text-[#c84b31] transition-colors">
                      {uploading ? 'sync' : 'add_a_photo'}
                    </span>
                    <input 
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface">Trạng thái Hiển thị</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    formData.isActive ? 'bg-[#52652a] text-white shadow-lg shadow-[#52652a]/20' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {formData.isActive ? 'Đang Hiện' : 'Đang Ẩn'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 border border-black/5">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Tên sản phẩm</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="text-xl font-medium text-on-surface border-b border-outline/20 focus:border-[#c84b31] py-2 outline-none transition-colors"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Danh mục</label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({...formData, category_slug: e.target.value})}
                    className="bg-transparent border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                  >
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Số lượng</label>
                  <input
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="bg-transparent border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                    type="number"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-transparent border border-outline/20 p-3 rounded-lg outline-none focus:border-[#c84b31] transition-colors"
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 border border-black/5">
              <h3 className="text-lg font-bold">Giá bán (VND)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Giá Bán Lẻ</label>
                  <input
                    required
                    value={formData.price_retail}
                    onChange={(e) => setFormData({...formData, price_retail: parseInt(e.target.value) || 0})}
                    className="border-b border-outline/20 py-2 font-bold text-[#c84b31] text-xl outline-none focus:border-[#c84b31]"
                    type="number"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Giá Bán Buôn</label>
                  <input
                    value={formData.price_wholesale}
                    onChange={(e) => setFormData({...formData, price_wholesale: parseInt(e.target.value) || 0})}
                    className="border-b border-outline/20 py-2 font-bold text-zinc-600 text-xl outline-none focus:border-zinc-400"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-[#1A1C1C] text-white font-bold py-5 rounded-xl shadow-lg transition-all hover:bg-[#c84b31] disabled:opacity-50"
            >
              {saving ? 'Đang lưu tác phẩm...' : 'Cập Nhật Tác Phẩm'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
