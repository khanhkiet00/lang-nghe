const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ─── Token Refresh Queue ────────────────────────────────────────────────────
// Đảm bảo chỉ có 1 lần gọi refresh tại một thời điểm.
// Mọi request bị 401 sẽ xếp hàng chờ, tránh race condition.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

function notifySubscribers(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// ─── Kiểm tra token có sắp hết hạn không (< 60 giây) ───────────────────────
function isTokenExpiredOrExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp as number; // epoch seconds
    const now = Math.floor(Date.now() / 1000);
    return expiry - now < 60; // còn dưới 60 giây thì xem như sắp hết hạn
  } catch {
    return true; // parse lỗi → coi như hết hạn
  }
}

// ─── Refresh Token ───────────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('langnghe_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // Refresh token hết hạn hoặc không hợp lệ → xóa token, buộc đăng nhập lại
      localStorage.removeItem('langnghe_access_token');
      localStorage.removeItem('langnghe_refresh_token');
      return null;
    }

    const json = await res.json();
    const newAccessToken = json?.accessToken ?? null;
    const newRefreshToken = json?.refreshToken ?? null;

    if (newAccessToken) {
      localStorage.setItem('langnghe_access_token', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('langnghe_refresh_token', newRefreshToken);
    }

    return newAccessToken;
  } catch {
    return null;
  }
}

// ─── Hàm lấy token hợp lệ (tự động refresh nếu sắp hết hạn) ────────────────
async function getValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('langnghe_access_token');
  if (!token) return null;

  // Nếu token còn đủ hạn, dùng luôn
  if (!isTokenExpiredOrExpiringSoon(token)) return token;

  // Token sắp/đã hết hạn → thực hiện refresh
  if (isRefreshing) {
    // Đã có request khác đang refresh → xếp hàng chờ
    return new Promise((resolve) => {
      subscribeTokenRefresh(resolve);
    });
  }

  isRefreshing = true;
  const newToken = await refreshAccessToken();
  isRefreshing = false;
  notifySubscribers(newToken);

  return newToken;
}

// ─── Core request function ───────────────────────────────────────────────────
async function request(
  path: string,
  options: RequestInit = {},
  _retry = true, // giữ lại cho tương thích ngược, nhưng logic đã được xử lý ở getValidToken
): Promise<Response> {
  // Lấy token hợp lệ (tự động refresh nếu cần)
  const token = await getValidToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  // FormData: để browser tự set Content-Type (bao gồm boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const response = await fetch(url, { ...options, headers });

  // Fallback: nếu vẫn 401 sau proactive refresh (ví dụ: server revoke token)
  // → thử refresh thêm 1 lần nữa
  if (response.status === 401 && _retry && !path.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      notifySubscribers(newToken);

      if (newToken) {
        return request(path, options, false); // retry 1 lần, không retry thêm
      }
    } else {
      // Đang refresh → chờ
      const newToken = await new Promise<string | null>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      if (newToken) {
        return request(path, options, false);
      }
    }
  }

  return response;
}

// ─── Public API client ───────────────────────────────────────────────────────
export const api = {
  get: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: 'GET' }),

  post: (path: string, body?: unknown, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (path: string, body?: unknown, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path: string, body?: unknown, options?: RequestInit) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: 'DELETE' }),
};
