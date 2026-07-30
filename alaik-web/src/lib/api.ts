import { useAuth } from '../store/auth';
import type {
  AppNotification,
  AuthResponse,
  CreateItemInput,
  EventSummary,
  EventType,
  GuestEvent,
  LinkPreview,
  OwnerEvent,
  User,
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5050';

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, logout } = useAuth.getState();
  if (!refreshToken) return null;
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    logout();
    return null;
  }
  const data = (await res.json()) as AuthResponse;
  setSession(data);
  return data.accessToken;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = opts;

  const doFetch = (token: string | null) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  const token = auth ? useAuth.getState().accessToken : useAuth.getState().accessToken;
  let res = await doFetch(token ?? null);

  // Transparently refresh once on 401 for authenticated requests.
  if (res.status === 401 && auth) {
    const fresh = await refreshAccessToken();
    if (fresh) res = await doFetch(fresh);
  }

  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, parsed);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // ---- auth ----
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: () => request<User>('/api/auth/me', { auth: true }),
  deleteAccount: () => request<void>('/api/auth/me', { method: 'DELETE', auth: true }),

  // ---- notifications ----
  getNotifications: () =>
    request<AppNotification[]>('/api/notifications', { auth: true }),
  markNotificationsRead: () =>
    request<void>('/api/notifications/read', { method: 'POST', auth: true }),

  // ---- events (owner) ----
  listEvents: (filter: 'mine' | 'reserved') =>
    request<EventSummary[]>(`/api/events?filter=${filter}`, { auth: true }),
  createEvent: (input: { title: string; type: EventType; eventDate: string | null }) =>
    request<OwnerEvent>('/api/events', { method: 'POST', body: input, auth: true }),
  getEvent: (id: string) => request<OwnerEvent>(`/api/events/${id}`, { auth: true }),
  addItem: (eventId: string, input: CreateItemInput) =>
    request<OwnerEvent>(`/api/events/${eventId}/items`, {
      method: 'POST',
      body: input,
      auth: true,
    }),
  updateItem: (itemId: string, input: CreateItemInput) =>
    request<void>(`/api/items/${itemId}`, { method: 'PUT', body: input, auth: true }),
  deleteItem: (itemId: string) =>
    request<void>(`/api/items/${itemId}`, { method: 'DELETE', auth: true }),

  // ---- link preview ----
  previewLink: (url: string) =>
    request<LinkPreview>('/api/link/preview', { method: 'POST', body: { url }, auth: true }),

  // ---- public / guest ----
  getGuestEvent: (slug: string, guestKey?: string) =>
    request<GuestEvent>(
      `/api/public/events/${slug}${guestKey ? `?guestKey=${encodeURIComponent(guestKey)}` : ''}`,
      { auth: true },
    ),
  reserve: (itemId: string, name?: string, guestKey?: string) =>
    request<{ isReserved: boolean; guestToken: string | null }>(
      `/api/public/items/${itemId}/reserve`,
      { method: 'POST', body: { name, guestToken: guestKey }, auth: true },
    ),
  cancelReserve: (itemId: string, guestKey?: string) =>
    request<{ isReserved: boolean; guestToken: string | null }>(
      `/api/public/items/${itemId}/cancel`,
      { method: 'POST', body: { guestToken: guestKey }, auth: true },
    ),
};

export { ApiError };
