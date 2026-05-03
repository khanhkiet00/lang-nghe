'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/images';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
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
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        const json = await res.json();
        const catData = json.data || [];
        
        // Append "Other" option
        const enhancedCats = [...catData, { id: 'other', name: 'Khác (Tự nhập...)', slug: 'other' }];
        setCategories(enhancedCats);
        
        if (catData.length > 0) {
          setFormData(prev => ({ ...prev, category_slug: catData[0].slug }));
        } else {
          setFormData(prev => ({ ...prev, category_slug: 'other' }));
        }
      } catch (error) {
        console.error('Failed to load categories');
      }
    };
    fetchCats();
  }, []);

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
        toast.success(`Đã tải lên ${files.length} ảnh thành công`);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls]
        }));
      } else {
        const err = await res.json();
        toast.error('Lỗi tải ảnh: ' + (err.message || 'Dung lượng file quá lớn (tối đa 5MB)'));
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
    if (formData.images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một ảnh sản phẩm.');
      return;
    }

    setLoading(true);
    let finalCategorySlug = formData.category_slug;

    // Handle new category creation
    if (formData.category_slug === 'other') {
      if (!newCategoryName.trim()) {
        toast.error('Vui lòng nhập tên danh mục mới.');
        setLoading(false);
        return;
      }

      try {
        const catRes = await api.post('/categories', { name: newCategoryName });

        if (catRes.ok) {
          const catJson = await catRes.json();
          finalCategorySlug = catJson.data.slug;
          toast.success('Đã tạo danh mục mới thành công');
        } else {
          const catErr = await catRes.json();
          toast.error('Lỗi khi tạo danh mục: ' + (catErr.message || 'Không xác định'));
          setLoading(false);
          return;
        }
      } catch (err) {
        toast.error('Lỗi kết nối khi tạo danh mục');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await api.post('/products', {
        ...formData,
        category_slug: finalCategorySlug
      });

      if (res.ok) {
        toast.success('Đăng sản phẩm thành công!');
        router.push('/nghe-nhan/san-pham');
      } else {
        const err = await res.json();
        toast.error('Lỗi: ' + (err.message || 'Không thể đăng sản phẩm'));
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <header className="px-8 pt-12 pb-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-tight">
            Đăng Sản Phẩm Mới
          </h2>
          <p className="text-on-surface-variant max-w-md">
            Tạo một mục niêm yết mới cho tác phẩm thủ công của bạn. 
          </p>
        </div>
      </header>

      <section className="px-8 pb-20 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block px-1">Hình ảnh sản phẩm (Tối đa 10 ảnh)</label>
              
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
                    <p className="text-[10px] font-bold text-on-surface-variant group-hover:text-[#c84b31] transition-colors">
                      {uploading ? 'Đang tải lên...' : 'Thêm ảnh'}
                    </p>
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
              <p className="text-[10px] text-stone-400 italic px-1">
                * Kích thước tối đa 5MB mỗi file. Định dạng: JPG, PNG, WEBP.
              </p>
            </div>
            
            <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-orange-800">tips_and_updates</span>
                <div>
                  <h4 className="text-sm font-bold text-orange-900 mb-1">Mẹo dành cho Nghệ nhân</h4>
                  <p className="text-xs text-orange-800/80 leading-relaxed">
                    Sử dụng ánh sáng tự nhiên để tôn vinh chất liệu gốm hoặc lụa của bạn. Hãy chụp từ 3-5 góc khác nhau.
                  </p>
                </div>
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
                  placeholder="Ví dụ: Bình Gốm Men Lam Cổ"
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
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Số lượng hiện có</label>
                  <input
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="bg-transparent border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                    placeholder="01"
                    type="number"
                  />
                </div>
              </div>

              {formData.category_slug === 'other' && (
                <div className="flex flex-col space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#c84b31]">Tên danh mục mới</label>
                  <input
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-transparent border-b-2 border-[#c84b31] py-2 outline-none text-on-surface font-bold placeholder:font-normal placeholder:text-stone-300"
                    placeholder="Nhập tên danh mục (vd: Trang Sức Phong Thủy...)"
                    type="text"
                  />
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Mô tả sản phẩm</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-transparent border border-outline/20 p-3 rounded-lg outline-none focus:border-[#c84b31] transition-colors"
                  placeholder="Kể câu chuyện về sản phẩm này..."
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 border border-black/5">
              <h3 className="text-lg font-bold text-on-surface">Thông tin Làng Nghề</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                  className="border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                  placeholder="Chất liệu (vd: Gốm nung)"
                />
                <input
                   value={formData.origin}
                   onChange={(e) => setFormData({...formData, origin: e.target.value})}
                   className="border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                   placeholder="Xuất xứ (vd: Bát Tràng)"
                />
                <div className="flex flex-col gap-1">
                   <label className="text-[10px] font-bold text-stone-400 uppercase">Ngày chế tác xong (dự kiến)</label>
                   <input
                      type="number"
                      value={formData.processingTime}
                      onChange={(e) => setFormData({...formData, processingTime: parseInt(e.target.value) || 0})}
                      className="border-b border-outline/20 py-2 outline-none focus:border-[#c84b31] transition-colors"
                   />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 border border-black/5">
              <h3 className="text-lg font-bold text-on-surface">Cấu hình Giá</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Giá Bán Lẻ (VND)</label>
                  <input
                    required
                    value={formData.price_retail}
                    onChange={(e) => setFormData({...formData, price_retail: parseInt(e.target.value) || 0})}
                    className="border-b border-outline/20 py-2 font-bold text-[#c84b31] text-xl outline-none focus:border-[#c84b31] transition-colors"
                    placeholder="500,000"
                    type="number"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Giá Bán Buôn (VND)</label>
                  <input
                    value={formData.price_wholesale}
                    onChange={(e) => setFormData({...formData, price_wholesale: parseInt(e.target.value) || 0})}
                    className="border-b border-outline/20 py-2 font-bold text-[#52652a] text-xl outline-none focus:border-[#52652a] transition-colors"
                    placeholder="350,000"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-[#c84b31] text-white font-bold py-5 rounded-xl shadow-lg shadow-[#c84b31]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? 'Đang thực hiện kỹ thuật nung...' : 'Đăng Sản Phẩm'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
