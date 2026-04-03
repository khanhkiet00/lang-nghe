'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>('login');
  // 1: Nhập Email | 2: Nhập OTP | 3: Nhập Mật khẩu & Tên
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode;
    if (modeParam && ['login', 'register'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const loginBg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOSZyhlHd-Pg0MRP6TPkXqL_rMsrt50xf8ZOF5eibbuYsIf3fCfFZEQqciyjiB95XJTCdfWdqzxyrQFI9FpiAQpxsQZETbmRLgks09nNq4eFjG5ekwACi4LAIqhn5unphM0rvPy-dhxDJdQYFutczyXbUZbNH-DOcThVLrAvUJ18IxUJAMoUdjZEBBSrIPWbVYV2YXtY30SMsTQ5Xy2s4NJQxnNmTKTjNgcFat8VJPXRS52JJY6qRj4MFqXV9-mTiS_AXmspg6vxjF';
  const registerBg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD2RCSkPJCv85G2cNyH7WpwuiBiaoGxytZqQf_CTDBHWDBJKEvi6km-x3lXLZGNw-h94BpWVgpmhRVn_GEI3wl3fodymttw1TpC9gPy1kAVoTsO7IMXHiP6HabkELqpcPs7wtAV4oWULB5CW6_lPI-m0J52OuZwRti72yzp2x0AAC3MDwnTf0aswBvB_-c8R78_-MK2ULRrciyZnZF8LEtduVlugBiPWE7Fv_erWXH8M5R2STZP4qgSMhnxzgSBWM9ed6Nlz4nQIYv1';

  const otpDigits = useMemo(() => {
    const clean = otp.replace(/\D/g, '').slice(0, 6);
    return Array.from({ length: 6 }, (_, index) => clean[index] ?? '');
  }, [otp]);

  // Bước 1: Xin OTP
  async function handleRequestOtp() {
    setLoading(true);
    setMessage('Đang gửi mã xác nhận...');
    try {
      const res = await fetch(`${API_BASE}/auth/request-register-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(`Thất bại: ${data?.message || res.statusText}`);
        setLoading(false);
        return;
      }

      setMessage('Đã gửi mã OTP đến email của bạn.');
      setCountdown(60);
      setRegisterStep(2);
    } catch {
      setMessage('Không thể gửi mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // Bước 2: Verify OTP
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
        setLoading(false);
        return;
      }

      setMessage('Xác thực email thành công. Vui lòng điền thông tin bên dưới.');
      setRegisterStep(3);
    } catch {
      setMessage('Không thể xác thực OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // Bước 3: Đăng ký (Hoàn tất)
  async function handleFinishRegister() {
    if (password !== passwordConfirm) {
      setMessage('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setMessage('Đang hoàn tất đăng ký...');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, passwordConfirm, displayName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(`Đăng ký thất bại: ${data?.message || res.statusText}`);
        return;
      }

      if (data?.accessToken) {
        localStorage.setItem('langnghe_access_token', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('langnghe_refresh_token', data.refreshToken);
      }

      setMessage('Đăng ký thành công! Đang chuyển về trang chủ...');
      router.push('/');
    } catch {
      setMessage('Không thể hoàn tất đăng ký. Vui lòng thử lại.');
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
      if (data?.refreshToken) {
        localStorage.setItem('langnghe_refresh_token', data.refreshToken);
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

    if (mode === 'login') {
      void handleLogin();
      return;
    }

    if (mode === 'register') {
      if (registerStep === 1) void handleRequestOtp();
      else if (registerStep === 2) void handleVerifyOtp();
      else if (registerStep === 3) void handleFinishRegister();
    }
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

        <section className="w-full lg:w-1/2 bg-[#f9f9f7] px-6 py-10 md:px-12 lg:px-16 flex items-center justify-center relative overflow-y-auto max-h-screen">
          <div className="w-full max-w-md">
            <div className="mb-8">  
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#835244]">Bước {registerStep} / 3</p>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-[-0.02em]">Gia Nhập Làng Nghề</h1>
              <p className="mt-2 text-base lg:text-lg text-[#5a605e]">Kết nối với linh hồn của nghệ thuật thủ công.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">

              {/* STEP 1: EMAIL */}
              {registerStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e] font-bold">Địa chỉ Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@heritage.com"
                      className="w-full rounded-md bg-[#dee4e066] px-4 py-3 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                      type="email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full rounded-md bg-[#835244] px-5 py-4 text-base font-semibold text-[#fff6f3] transition-all duration-200 hover:bg-[#754638] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Đang kiểm tra...' : 'Nhận Mã Xác Thực (OTP)'}
                  </button>
                </div>
              )}

              {/* STEP 2: OTP */}
              {registerStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center bg-[#f2f4f2] p-4 rounded-md">
                    <p className="text-sm text-[#5a605e]">
                      Chúng tôi đã gửi mã xác thực tới email <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="h-14 rounded-md bg-[#dee4e066] text-center text-xl font-semibold outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_2px_#835244]"
                        maxLength={1}
                        inputMode="numeric"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <button type="button" onClick={() => setRegisterStep(1)} className="text-[#5a605e] hover:text-[#835244] font-medium">← Thay đổi email</button>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleRequestOtp}
                      className="font-bold text-[#835244] hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Nhận lại mã'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full rounded-md bg-[#835244] px-5 py-4 text-base font-semibold text-[#fff6f3] transition-all duration-200 hover:bg-[#754638] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Đang xác minh...' : 'Xác Minh & Tiếp Tục'}
                  </button>
                </div>
              )}

              {/* STEP 3: DETAILS */}
              {registerStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e] font-bold">Họ và Tên</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-md bg-[#dee4e066] px-4 py-3 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                      type="text"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e] font-bold">Mật khẩu</label>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="w-full rounded-md bg-[#dee4e066] px-4 py-3 pr-12 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a605e] hover:text-[#835244] transition-colors focus:outline-none"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.22em] text-[#5a605e] font-bold">Xác nhận Mật khẩu</label>
                    <input
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="********"
                      className="w-full rounded-md bg-[#dee4e066] px-4 py-3 outline-none transition-all duration-200 focus-visible:bg-white focus-visible:shadow-[inset_0_0_0_1px_#83524433]"
                      type="password"
                      required
                      minLength={8}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password || !passwordConfirm || !displayName}
                    className="w-full mt-4 rounded-md bg-[#835244] px-5 py-4 text-base font-bold tracking-tight text-[#fff6f3] transition-all duration-200 hover:bg-[#754638] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Đang tạo...' : 'Hoàn Tất Đăng Ký'}
                  </button>
                </div>
              )}

            </form>

            {message && <p className="mt-4 rounded-md bg-[#f2f4f2] px-4 py-3 text-sm text-[#5a605e] font-medium border border-[#dee4e0]">{message}</p>}

            <div className="mt-8 pt-6 border-t border-[#dee4e0] text-center">
              <p className="text-sm text-[#5a605e]">
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => { setMode('login'); setRegisterStep(1); }} className="font-semibold text-[#835244] hover:underline">
                  Đăng Nhập
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return null;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#5a605e]">Đang tải giao diện...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
