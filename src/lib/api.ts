const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'magb_access_token';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest<T = any>(
  path: string,
  method: ApiMethod = 'GET',
  body?: unknown
): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const headers = new Headers();

    if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

