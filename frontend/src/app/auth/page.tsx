'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'verify';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [joinAs, setJoinAs] = useState<'buyer' | 'artisan'>('buyer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode;
    if (modeParam && ['login', 'register', 'verify'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const loginBg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOSZyhlHd-Pg0MRP6TPkXqL_rMsrt50xf8ZOF5eibbuYsIf3fCfFZEQqciyjiB95XJTCdfWdqzxyrQFI9FpiAQpxsQZETbmRLgks09nNq4eFjG5ekwACi4LAIqhn5unphM0rvPy-dhxDJdQYFutczyXbUZbNH-DOcThVLrAvUJ18IxUJAMoUdjZEBBSrIPWbVYV2YXtY30SMsTQ5Xy2s4NJQxnNmTKTjNgcFat8VJPXRS52JJY6qRj4MFqXV9-mTiS_AXmspg6vxjF';
  const registerBg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD2RCSkPJCv85G2cNyH7WpwuiBiaoGxytZqQf_CTDBHWDBJKEvi6km-x3lXLZGNw-h94BpWVgpmhRVn_GEI3wl3fodymttw1TpC9gPy1kAVoTsO7IMXHiP6HabkELqpcPs7wtAV4oWULB5CW6_lPI-m0J52OuZwRti72yzp2x0AAC3MDwnTf0aswBvB_-c8R78_-MK2ULRrciyZnZF8LEtduVlugBiPWE7Fv_erWXH8M5R2STZP4qgSMhnxzgSBWM9ed6Nlz4nQIYv1';

  const title = useMemo(() => {
    if (mode === 'register') return 'Tạo tài khoản';
    if (mode === 'verify') return 'Xác thực OTP';
    return 'Đăng nhập';
  }, [mode]);

  const otpDigits = useMemo(() => {
    const clean = otp.replace(/\D/g, '').slice(0, 6);
    return Array.from({ length: 6 }, (_, index) => clean[index] ?? '');
  }, [otp]);

  async function handleRegister() {
    setLoading(true);
    setMessage('Đang tạo tài khoản...');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(`Đăng ký thất bại: ${data?.message || res.statusText}`);
        return;
      }

      setMessage('Đăng ký thành công. Kiểm tra mã OTP trong email của bạn, sau đó tiến hành xác thực.');
      setMode('verify');
    } catch {
      setMessage('Không thể đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setMessage('Đang xác thực OTP...');

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Xác thực thất bại: ${data?.message || res.statusText}`);
        return;
      }

      setMessage('Xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.');
      setMode('login');
    } catch {
      setMessage('Không thể xác thực OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setMessage('Đang đăng nhập...');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Đăng nhập thất bại: ${data?.message || res.statusText}`);
        return;
      }

      if (data?.accessToken) {
        localStorage.setItem('langnghe_access_token', data.accessToken);
      }

      setMessage('Đăng nhập thành công. Đang chuyển về trang chủ...');
      router.push('/');
    } catch {
      setMessage('Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === 'register') {
      void handleRegister();
      return;
    }

    if (mode === 'verify') {
      void handleVerifyOtp();
      return;
    }

    void handleLogin();
  }

  // CẢI TIẾN 1: Tự động nhảy ô khi gõ tay
  function handleOtpDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtp(next.join(''));

    // Chuyển focus sang ô tiếp theo nếu nhập số
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  // CẢI TIẾN 2: Lùi về ô trước khi bấm Backspace
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }

  // CẢI TIẾN 3: Xử lý dán (Paste) hàng loạt
  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    // Chỉ lấy số và tối đa 6 ký tự
    const cleanData = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (cleanData) {
      setOtp(cleanData);
      // Tự động focus vào ô tương ứng cuối cùng
      const focusIndex = Math.min(cleanData.length, 5);
      const focusInput = document.getElementById(`otp-${focusIndex}`);
      if (focusInput) focusInput.focus();
    }
  }

  if (mode === 'login') {
    return (
      <main className="min-h-screen bg-[#f9f9f7] text-[#2e3432] lg:flex">
        <section className="w-full lg:w-1/2 bg-gradient-to-br from-[#f9f9f7] via-[#f2f4f2] to-[#e8ebe8] px-6 py-10 md:px-12 lg:px-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#835244]">Nền Tảng Làng Nghề</p>
              <h1 className="mt-4 text-6xl font-bold tracking-[-0.02em] leading-none">Đăng Nhập</h1>
              <p className="mt-4 text-lg text-[#5a605e]">Quay trở lại với những tác phẩm tuyệt vời của bạn.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-[0.22em] text-[#5a605e]">Địa chỉ Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@artisan.com"
                  className="w-full rounded-sm bg-[#dee4e066] px-4 py-3 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e]">Mật khẩu</label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#835244] cursor-pointer hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-sm bg-[#dee4e066] px-4 py-3 pr-12 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a605e] hover:text-[#835244] transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#835244] px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-[#754638] disabled:opacity-70"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>

            {message && <p className="mt-4 rounded-md bg-[#f2f4f2] px-4 py-3 text-sm text-[#5a605e]">{message}</p>}

            <p className="mt-8 text-center text-sm text-[#5a605e]">
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => setMode('register')} className="font-semibold text-[#835244] hover:underline">
                Tạo tài khoản
              </button>
            </p>
          </div>
        </section>

        <section className="hidden lg:flex w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${loginBg})` }}>
          <div className="absolute inset-0 bg-black/20" />
        </section>
      </main>
    );
  }

  if (mode === 'register') {
    return (
      <main className="min-h-screen bg-[#f9f9f7] text-[#2e3432] lg:flex">
        <section className="relative hidden lg:flex lg:w-1/2 overflow-hidden">
          <img src={registerBg} alt="Craft texture" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-14 left-12 right-12 text-white">
            <p className="mb-6 text-xs uppercase tracking-[0.22em]">NỀN TẢNG LÀNG NGHỀ</p>
            <h2 className="mb-6 text-6xl font-bold leading-[1.08] tracking-[-0.02em]">
              Gìn giữ nhịp thoi đưa, chắt chiu từng sợi chỉ.
            </h2>
            <p className="max-w-xl text-xl text-white/85">
              Tham gia cộng đồng tôn vinh giá trị đích thực của nghệ thuật thủ công truyền thống.
            </p>
          </div>
        </section>

        <section className="w-full lg:w-1/2 bg-[#f9f9f7] px-6 py-10 md:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">  
              <p className="mb-4 text-lg font-semibold">Nền Tảng Làng Nghề</p>
              <h1 className="text-5xl font-bold tracking-[-0.02em]">Gia Nhập Làng Nghề</h1>
              <p className="mt-2 text-lg text-[#5a605e]">Kết nối với linh hồn của nghệ thuật thủ công.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e]">Địa chỉ Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@heritage.com"
                  className="w-full rounded-sm bg-[#dee4e066] px-4 py-3 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e]">Mật khẩu</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-sm bg-[#dee4e066] px-4 py-3 pr-12 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a605e] hover:text-[#835244] transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#835244] px-5 py-4 text-base font-semibold text-[#fff6f3] transition-all duration-200 hover:bg-[#754638] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
              </button>
            </form>

            {message && <p className="mt-4 rounded-md bg-[#f2f4f2] px-4 py-3 text-sm text-[#5a605e]">{message}</p>}

            <p className="mt-6 text-center text-sm text-[#5a605e]">
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-semibold text-[#835244] hover:underline">
                Đăng Nhập
              </button>
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (mode === 'verify') {
    return (
      <main className="min-h-screen bg-[#f9f9f7] text-[#2e3432]">
        <div className="pointer-events-none fixed inset-0 opacity-15">
          <img src={registerBg} alt="Craft background" className="h-full w-full object-cover" />
        </div>

        <header className="relative z-10 bg-[#f9f9f7cc] backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-8 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-[0.12em]">NỀN TẢNG LÀNG NGHỀ</h1>
          </div>
          <div className="h-px w-full bg-[#f2f4f2]" />
        </header>

        <section className="relative z-10 flex min-h-[calc(100vh-210px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-xl bg-white px-8 py-10 shadow-[0_20px_40px_rgba(46,52,50,0.06)]">
            <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdbd0] text-3xl text-[#835244]">
              ✉
            </div>

            <h2 className="text-center text-5xl font-bold tracking-[-0.02em]">Xác Minh Danh Tính</h2>
            <p className="mx-auto mt-3 max-w-[260px] text-center text-base text-[#5a605e]">
              Chúng tôi đã gửi một mã gồm 6 chữ số tới email của bạn.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-8">
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`} // Đã thêm ID để JS gọi lệnh Focus
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)} // Gọi sự kiện lùi nút
                    onPaste={handleOtpPaste} // Gọi sự kiện dán
                    className="h-14 rounded-sm bg-[#dee4e066] text-center text-xl font-semibold outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full rounded-md bg-[#835244] px-5 py-4 text-base font-semibold text-[#fff6f3] transition-all duration-200 hover:bg-[#754638] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Đang xác minh...' : 'Xác Minh & Tiếp Tục'}
              </button>
            </form>

            {message && <p className="mt-4 rounded-md bg-[#f2f4f2] px-4 py-3 text-sm text-[#5a605e]">{message}</p>}

            <div className="mt-9 border-t border-[#e5e9e6] pt-7 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm font-semibold text-[#835244] transition-colors hover:text-[#754638]"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>
        </section>

        <footer className="relative z-10 bg-[#f9f9f7cc] px-6 py-8 backdrop-blur-md">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-[#5a605e]">
            © 2024 Nghệ Nhân Số. Gìn giữ di sản.
          </p>
        </footer>
      </main>
    );
  }
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
