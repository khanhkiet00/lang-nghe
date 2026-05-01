const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function refreshAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const refreshToken = localStorage.getItem('langnghe_refresh_token');
  if (!refreshToken) {
    return null;
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem('langnghe_access_token');
    localStorage.removeItem('langnghe_refresh_token');
    return null;
  }

  const json = await res.json();
  if (json?.accessToken) {
    localStorage.setItem('langnghe_access_token', json.accessToken);
  }
  if (json?.refreshToken) {
    localStorage.setItem('langnghe_refresh_token', json.refreshToken);
  }

  return json?.accessToken ?? null;
}

async function request(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('langnghe_access_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, don't set Content-Type header to allow browser to set boundary
  if (options.body instanceof FormData) {
    if (headers['Content-Type' as keyof typeof headers]) {
      delete headers['Content-Type' as keyof typeof headers];
    }
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && !path.includes('/auth/')) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return request(path, options, false);
    }
  }

  return response;
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) => 
    request(path, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  patch: (path: string, body?: any, options?: RequestInit) => 
    request(path, { 
      ...options, 
      method: 'PATCH', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  put: (path: string, body?: any, options?: RequestInit) => 
    request(path, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
