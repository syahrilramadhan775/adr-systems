const API_PREFIX = '/api/v1';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('adr_access_token');
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem('adr_user');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  window.localStorage.setItem('adr_access_token', session.token);
  window.localStorage.setItem('adr_user', JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('adr_access_token');
  window.localStorage.removeItem('adr_user');
}

export function logout() {
  clearSession();
  if (typeof window !== 'undefined') window.location.assign('/login');
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
    cache: 'no-store'
  });
  let payload = null;
  if (response.status !== 204) {
    payload = await response.json().catch(() => null);
  }

  if (response.status === 401 && path !== '/auth/login' && typeof window !== 'undefined') {
    clearSession();
    if (window.location.pathname !== '/login') window.location.assign('/login');
  }
  if (!response.ok) {
    const message = payload?.error?.message || `Request gagal (HTTP ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.error?.details;
    throw error;
  }
  return payload?.data;
}
