'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CART_CHANGED_EVENT,
  getCartItems,
  saveCartItems,
  type CartItem,
} from '@/lib/cart';
import { resolveImageUrl } from '@/lib/images';

const CHECKOUT_SELECTION_KEY = 'langnghe_checkout_item_ids';
const VIETNAM_LOCATION_API = 'https://provinces.open-api.vn/api/v1';
const productFallbackImage =
  'https://images.unsplash.com/photo-1621376436442-999335805822?q=80&w=600&auto=format&fit=crop';

type ShippingAddress = {
  id: string;
  label?: string | null;
  name: string;
  phone: string;
  address: string;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  isDefault: boolean;
};

type AddressForm = {
  label: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
};

type ProvinceOption = {
  code: number;
  name: string;
};

type DistrictOption = {
  code: number;
  name: string;
};

type WardOption = {
  code: number;
  name: string;
};

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

function emptyAddressForm(): AddressForm {
  return {
    label: '',
    name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    isDefault: false,
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [noteFromBuyer, setNoteFromBuyer] = useState('');
  const [notice, setNotice] = useState('');
  const [addressModalError, setAddressModalError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState('');
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('langnghe_access_token');
    if (!token) {
      router.push('/auth?mode=login');
      return;
    }

    const cartItems = getCartItems();
    const rawSelectedIds = sessionStorage.getItem(CHECKOUT_SELECTION_KEY);
    const selectedIds = rawSelectedIds
      ? (JSON.parse(rawSelectedIds) as string[])
      : cartItems.map((item) => item.id);
    setItems(cartItems.filter((item) => selectedIds.includes(item.id)));

    void fetchAddresses();
  }, [router]);

  useEffect(() => {
    void fetchProvinces();
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const res = await api.get('/shipping-addresses');
      if (!res.ok) {
        throw new Error('Không thể tải địa chỉ nhận hàng');
      }
      const json = await res.json();
      const nextAddresses = (json.data ?? []) as ShippingAddress[];
      setAddresses(nextAddresses);
      const preferred = nextAddresses.find((item) => item.isDefault) ?? nextAddresses[0];
      setSelectedAddressId((current) => current || preferred?.id || '');
    } catch (error) {
      console.error('Failed to fetch shipping addresses:', error);
      setNotice('Chưa tải được địa chỉ nhận hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProvinces() {
    setLocationLoading(true);
    setLocationError('');

    try {
      const res = await fetch(`${VIETNAM_LOCATION_API}/p`);
      if (!res.ok) {
        throw new Error('Không thể tải tỉnh thành');
      }

      const data = (await res.json()) as ProvinceOption[];
      setProvinces(data);
    } catch (error) {
      console.error('Failed to fetch Vietnam provinces:', error);
      setLocationError('Không tải được bộ lọc địa chỉ Việt Nam. Bạn có thể nhập địa chỉ thủ công.');
    } finally {
      setLocationLoading(false);
    }
  }

  async function fetchDistricts(provinceCode: string) {
    setDistricts([]);
    setWards([]);
    setSelectedDistrictCode('');

    if (!provinceCode) return;

    try {
      const res = await fetch(`${VIETNAM_LOCATION_API}/p/${provinceCode}?depth=2`);
      if (!res.ok) {
        throw new Error('Không thể tải quận huyện');
      }
      const data = (await res.json()) as { districts?: DistrictOption[] };
      setDistricts(data.districts ?? []);
    } catch (error) {
      console.error('Failed to fetch Vietnam districts:', error);
      setLocationError('Không tải được danh sách quận/huyện. Bạn có thể nhập địa chỉ thủ công.');
    }
  }

  async function fetchWards(districtCode: string) {
    setWards([]);

    if (!districtCode) return;

    try {
      const res = await fetch(`${VIETNAM_LOCATION_API}/d/${districtCode}?depth=2`);
      if (!res.ok) {
        throw new Error('Không thể tải phường xã');
      }
      const data = (await res.json()) as { wards?: WardOption[] };
      setWards(data.wards ?? []);
    } catch (error) {
      console.error('Failed to fetch Vietnam wards:', error);
      setLocationError('Không tải được danh sách phường/xã. Bạn có thể nhập địa chỉ thủ công.');
    }
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shippingFee = items.length === 0 || subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const artisanIds = Array.from(new Set(items.map((item) => item.artisanId)));
  const hasMultipleArtisans = artisanIds.length > 1;

  function openAddressModal(address?: ShippingAddress) {
    setLocationError('');
    setAddressModalError('');
    setDistricts([]);
    setWards([]);
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');

    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        label: address.label || '',
        name: address.name,
        phone: address.phone,
        address: address.address,
        ward: address.ward || '',
        district: address.district || '',
        province: address.province || '',
        isDefault: address.isDefault,
      });

      const matchedProvince = provinces.find((item) => item.name === address.province);
      if (matchedProvince) {
        const provinceCode = String(matchedProvince.code);
        setSelectedProvinceCode(provinceCode);
        void fetchDistricts(provinceCode).then(async () => {
          const districtRes = await fetch(`${VIETNAM_LOCATION_API}/p/${provinceCode}?depth=2`);
          if (!districtRes.ok) return;
          const provinceData = (await districtRes.json()) as { districts?: DistrictOption[] };
          const matchedDistrict = provinceData.districts?.find((item) => item.name === address.district);
          if (!matchedDistrict) return;
          const districtCode = String(matchedDistrict.code);
          setDistricts(provinceData.districts ?? []);
          setSelectedDistrictCode(districtCode);
          await fetchWards(districtCode);
        });
      }
    } else {
      setEditingAddressId(null);
      setAddressForm(emptyAddressForm());
    }
    setAddressModalOpen(true);
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true);
    setNotice('');
    setAddressModalError('');

    try {
      const payload = {
        ...addressForm,
        label: addressForm.label || undefined,
        ward: addressForm.ward || undefined,
        district: addressForm.district || undefined,
        province: addressForm.province || undefined,
      };
      const res = editingAddressId
        ? await api.patch(`/shipping-addresses/${editingAddressId}`, payload)
        : await api.post('/shipping-addresses', payload);

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để lưu địa chỉ.');
        }
        throw new Error(json?.message || 'Không thể lưu địa chỉ');
      }

      const json = await res.json();
      setSelectedAddressId(json.data.id);
      setAddressModalOpen(false);
      await fetchAddresses();
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressModalError(
        error instanceof Error
          ? error.message
          : 'Chưa lưu được địa chỉ. Vui lòng kiểm tra thông tin.',
      );
    } finally {
      setSavingAddress(false);
    }
  }

  async function placeOrder() {
    setNotice('');

    if (items.length === 0) {
      setNotice('Bạn chưa chọn sản phẩm để thanh toán.');
      return;
    }

    if (hasMultipleArtisans) {
      setNotice('Mỗi đơn hiện chỉ hỗ trợ sản phẩm từ một nghệ nhân. Vui lòng quay lại giỏ hàng để tách đơn.');
      return;
    }

    if (!selectedAddress) {
      setNotice('Vui lòng chọn hoặc thêm địa chỉ nhận hàng.');
      return;
    }

    if (!artisanIds[0] || items.some((item) => !item.id)) {
      setNotice(
        'Giỏ hàng có sản phẩm thiếu dữ liệu. Vui lòng xóa sản phẩm đó khỏi giỏ và thêm lại từ trang chi tiết sản phẩm.',
      );
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await api.post('/orders', {
        artisanId: artisanIds[0],
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          ward: selectedAddress.ward || undefined,
          district: selectedAddress.district || undefined,
          province: selectedAddress.province || undefined,
        },
        noteFromBuyer: noteFromBuyer || undefined,
        paymentMethod,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = Array.isArray(json?.message)
          ? json.message.join(', ')
          : json?.message;
        throw new Error(message || 'Không thể đặt hàng');
      }

      const json = await res.json();
      const orderedIds = new Set(items.map((item) => item.id));
      saveCartItems(getCartItems().filter((item) => !orderedIds.has(item.id)));
      window.dispatchEvent(new Event(CART_CHANGED_EVENT));
      sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
      setOrderSuccessId(json.data?.id || '');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Đặt hàng thất bại');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (orderSuccessId) {
    return (
      <main className="min-h-screen bg-[#F9F9F7] px-6 py-24 text-[#1A1C1C]">
        <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4ECA2] text-[#52652A]">
            <span className="material-symbols-outlined text-4xl">check</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Đặt hàng thành công</h1>
          <p className="mt-3 text-sm font-bold text-zinc-500">
            Mã đơn hàng: {orderSuccessId}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="rounded-2xl bg-[#1A1C1C] px-6 py-3 text-sm font-bold text-white">
              Tiếp tục mua sắm
            </Link>
            <Link href="/ho-so" className="rounded-2xl bg-[#C84B31] px-6 py-3 text-sm font-bold text-white">
              Xem hồ sơ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F9F7] pb-20 text-[#1A1C1C]">
      <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-[#C84B31]">
            Làng Nghề
          </Link>
          <span className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#58413C] md:flex">
            <span className="material-symbols-outlined text-sm">lock</span>
            Thanh toán an toàn
          </span>
        </nav>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pt-28 md:px-8 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFDAD3] text-sm font-black text-[#A6331B]">1</span>
              <h1 className="text-3xl font-black tracking-tight">Thông tin vận chuyển</h1>
            </div>

            {loading ? (
              <p className="text-sm font-bold text-zinc-500">Đang tải địa chỉ nhận hàng...</p>
            ) : addresses.length === 0 ? (
              <button
                onClick={() => openAddressModal()}
                className="w-full rounded-2xl bg-white p-8 text-left shadow-sm transition-all hover:shadow-xl"
              >
                <span className="text-sm font-black uppercase tracking-widest text-[#C84B31]">Thêm địa chỉ đầu tiên</span>
                <p className="mt-2 text-zinc-500">Lưu địa chỉ để dùng lại cho các lần mua sau.</p>
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all ${
                      selectedAddressId === address.id ? 'ring-2 ring-[#C84B31]/25' : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="shipping-address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 h-5 w-5 text-[#C84B31] focus:ring-[#C84B31]/20"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{address.label || address.name}</p>
                          {address.isDefault && (
                            <span className="rounded-full bg-[#D4ECA2] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#52652A]">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#58413C]">
                          {address.name} • {address.phone}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {[address.address, address.ward, address.district, address.province]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openAddressModal(address);
                        }}
                        className="text-sm font-black text-[#C84B31]"
                      >
                        Sửa
                      </button>
                    </div>
                  </label>
                ))}
                <button
                  onClick={() => openAddressModal()}
                  className="rounded-2xl bg-[#F3F3F3] px-5 py-4 text-left text-sm font-black text-[#C84B31] transition-colors hover:bg-white"
                >
                  + Thêm địa chỉ nhận hàng
                </button>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFDAD3] text-sm font-black text-[#A6331B]">2</span>
              <h2 className="text-2xl font-black tracking-tight">Phương thức thanh toán</h2>
            </div>
            <div className="space-y-4">
              {[
                ['cod', 'Thanh toán khi nhận hàng (COD)', 'Kiểm tra sản phẩm trước khi thanh toán.'],
                ['bank_transfer', 'Chuyển khoản ngân hàng', 'Thanh toán qua chuyển khoản sau khi đặt đơn.'],
              ].map(([value, title, description]) => (
                <label key={value} className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value as 'cod' | 'bank_transfer')}
                    className="h-5 w-5 text-[#C84B31] focus:ring-[#C84B31]/20"
                  />
                  <span>
                    <span className="block font-black">{title}</span>
                    <span className="text-sm text-zinc-500">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-[#58413C]">Ghi chú cho nghệ nhân</label>
            <textarea
              value={noteFromBuyer}
              onChange={(event) => setNoteFromBuyer(event.target.value)}
              className="min-h-[110px] w-full rounded-2xl border-0 bg-white p-5 text-sm shadow-sm focus:ring-2 focus:ring-[#C84B31]/20"
              placeholder="Ví dụ: giao giờ hành chính, đóng gói làm quà tặng..."
            />
          </section>
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-2xl font-black tracking-tight">Tóm tắt đơn hàng</h2>
            {items.length === 0 ? (
              <div className="rounded-2xl bg-[#F3F3F3] p-8 text-center">
                <p className="text-sm font-bold text-zinc-500">Chưa có sản phẩm được chọn.</p>
                <Link href="/gio-hang" className="mt-4 inline-flex text-sm font-black text-[#C84B31]">
                  Quay lại giỏ hàng
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 max-h-80 space-y-5 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F3F3]">
                        <img
                          className="h-full w-full object-cover"
                          src={resolveImageUrl(item.imageUrl, productFallbackImage)}
                          alt={item.title}
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-black">{item.title}</h3>
                          <p className="mt-1 text-xs text-zinc-500">Số lượng: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-black text-[#C84B31]">{formatVnd(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-[#58413C]">
                    <span>Tạm tính</span>
                    <span className="font-bold">{formatVnd(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#58413C]">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold">{shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}</span>
                  </div>
                  <div className="flex items-end justify-between border-t border-[#E0BFB9]/40 pt-5">
                    <span className="text-lg font-black">Tổng cộng</span>
                    <span className="text-3xl font-black tracking-tight text-[#C84B31]">{formatVnd(total)}</span>
                  </div>
                </div>

                {notice && (
                  <p className="mt-5 rounded-2xl bg-[#FFF4F1] px-4 py-3 text-sm font-bold text-[#A6331B]">
                    {notice}
                  </p>
                )}

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || items.length === 0}
                  className="mt-8 w-full rounded-2xl bg-[#C84B31] py-5 text-lg font-black text-white shadow-xl shadow-[#C84B31]/20 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {placingOrder ? 'Đang đặt hàng...' : 'Đặt hàng ngay'}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {addressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            aria-label="Đóng"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAddressModalOpen(false)}
          />
          <form
            onSubmit={saveAddress}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  {editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Địa chỉ sẽ được lưu cho những lần thanh toán sau.</p>
              </div>
              <button type="button" onClick={() => setAddressModalOpen(false)} className="rounded-full bg-[#F3F3F3] p-3">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {addressModalError && (
              <p className="mb-6 rounded-2xl bg-[#FFF4F1] px-4 py-3 text-sm font-bold text-[#A6331B]">
                {addressModalError}
              </p>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                ['label', 'Tên gợi nhớ', 'Nhà riêng, công ty...'],
                ['name', 'Họ tên người nhận', 'Nguyễn Văn A'],
                ['phone', 'Số điện thoại', '0901234567'],
              ].map(([field, label, placeholder]) => (
                <label key={field} className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">{label}</span>
                  <input
                    required={field === 'name' || field === 'phone'}
                    value={addressForm[field as keyof AddressForm] as string}
                    onChange={(event) =>
                      setAddressForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20"
                    placeholder={placeholder}
                  />
                </label>
              ))}

              {locationError ? (
                <>
                  {[
                    ['province', 'Tỉnh / Thành phố', 'Hà Nội'],
                    ['district', 'Quận / Huyện', 'Ba Đình'],
                    ['ward', 'Phường / Xã', 'Phúc Xá'],
                  ].map(([field, label, placeholder]) => (
                    <label key={field} className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">{label}</span>
                      <input
                        value={addressForm[field as keyof AddressForm] as string}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20"
                        placeholder={placeholder}
                      />
                    </label>
                  ))}
                </>
              ) : (
                <>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">Tỉnh / Thành phố</span>
                    <select
                      value={selectedProvinceCode}
                      onChange={(event) => {
                        const provinceCode = event.target.value;
                        const province = provinces.find((item) => String(item.code) === provinceCode);
                        setSelectedProvinceCode(provinceCode);
                        setAddressForm((current) => ({
                          ...current,
                          province: province?.name || '',
                          district: '',
                          ward: '',
                        }));
                        void fetchDistricts(provinceCode);
                      }}
                      className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20"
                    >
                      <option value="">{locationLoading ? 'Đang tải...' : 'Chọn tỉnh / thành phố'}</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">Quận / Huyện</span>
                    <select
                      value={selectedDistrictCode}
                      disabled={!selectedProvinceCode}
                      onChange={(event) => {
                        const districtCode = event.target.value;
                        const district = districts.find((item) => String(item.code) === districtCode);
                        setSelectedDistrictCode(districtCode);
                        setAddressForm((current) => ({
                          ...current,
                          district: district?.name || '',
                          ward: '',
                        }));
                        void fetchWards(districtCode);
                      }}
                      className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20 disabled:opacity-60"
                    >
                      <option value="">Chọn quận / huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">Phường / Xã</span>
                    <select
                      value={addressForm.ward}
                      disabled={!selectedDistrictCode}
                      onChange={(event) =>
                        setAddressForm((current) => ({
                          ...current,
                          ward: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20 disabled:opacity-60"
                    >
                      <option value="">Chọn phường / xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {locationError && (
                <p className="rounded-2xl bg-[#FFF4F1] px-4 py-3 text-sm font-bold text-[#A6331B] md:col-span-2">
                  {locationError}
                </p>
              )}

              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#58413C]/70">Địa chỉ chi tiết</span>
                <input
                  required
                  value={addressForm.address}
                  onChange={(event) =>
                    setAddressForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border-0 bg-[#F3F3F3] px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#C84B31]/20"
                  placeholder="Số nhà, tên đường..."
                />
              </label>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) =>
                    setAddressForm((current) => ({
                      ...current,
                      isDefault: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded text-[#C84B31] focus:ring-[#C84B31]/20"
                />
                <span className="text-sm font-bold text-[#58413C]">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="flex-1 rounded-2xl bg-[#F3F3F3] py-4 text-sm font-black text-[#58413C]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={savingAddress}
                className="flex-[2] rounded-2xl bg-[#C84B31] py-4 text-sm font-black text-white disabled:opacity-50"
              >
                {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
