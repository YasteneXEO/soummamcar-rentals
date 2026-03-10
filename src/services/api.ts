/**
 * Centralized API client for SoummamCar frontend.
 * Handles authentication tokens, refresh, and error mapping.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Token Management ──────────────────────────────────────────
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function loadTokens() {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

// Load on module init
loadTokens();

// ─── API Error ─────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core Fetch ────────────────────────────────────────────────
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Handle 401 — try refresh
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, false);
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || 'Request failed', body.errors);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Multipart (file uploads) ──────────────────────────────────
async function uploadRequest<T>(
  path: string,
  formData: FormData,
  method = 'POST',
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || 'Upload failed');
  }

  return res.json();
}

// ─── Auth API ──────────────────────────────────────────────────
export const authApi = {
  register: (data: { fullName: string; email: string; phone: string; password: string; isDiaspora?: boolean; country?: string }) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => {
      setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      return res;
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => {
      setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      return res;
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }).finally(clearTokens),

  getProfile: () =>
    request<any>('/auth/me').then((res) => res.data || res),

  updateProfile: (data: any) =>
    request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }).then((res) => res.data || res),
};

// ─── Vehicles API ──────────────────────────────────────────────
export const vehiclesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/vehicles${qs}`);
  },

  getById: (id: string) =>
    request<any>(`/vehicles/${id}`),

  checkAvailability: (id: string, startDate: string, endDate: string) =>
    request<{ available: boolean }>(`/vehicles/${id}/availability?startDate=${startDate}&endDate=${endDate}`),

  create: (data: any) =>
    request<any>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    request<any>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<void>(`/vehicles/${id}`, { method: 'DELETE' }),
};

// ─── Reservations API ──────────────────────────────────────────
export const reservationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/reservations${qs}`);
  },

  getById: (id: string) =>
    request<any>(`/reservations/${id}`),

  create: (data: any) =>
    request<any>('/reservations', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: string, data: { status: string; cancellationReason?: string }) =>
    request<any>(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  getMyReservations: () =>
    request<any>('/reservations/my'),
};

// ─── Payments API ──────────────────────────────────────────────
export const paymentsApi = {
  initiateCib: (data: any) =>
    request<{ paymentId: string; redirectUrl: string }>('/payments/cib', { method: 'POST', body: JSON.stringify(data) }),

  initiateStripe: (data: any) =>
    request<{ paymentId: string; checkoutUrl: string }>('/payments/stripe', { method: 'POST', body: JSON.stringify(data) }),

  confirmCash: (data: any) =>
    request<any>('/payments/cash', { method: 'POST', body: JSON.stringify(data) }),

  confirmTransfer: (data: any) =>
    request<any>('/payments/transfer', { method: 'POST', body: JSON.stringify(data) }),

  refund: (id: string, data: { amount?: number; reason?: string }) =>
    request<any>(`/payments/${id}/refund`, { method: 'POST', body: JSON.stringify(data) }),

  listByReservation: (reservationId: string) =>
    request<any[]>(`/payments/reservation/${reservationId}`),
};

// ─── Contracts API ─────────────────────────────────────────────
export const contractsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/contracts${qs}`);
  },

  getById: (id: string) =>
    request<any>(`/contracts/${id}`),

  create: (data: any) =>
    request<any>('/contracts', { method: 'POST', body: JSON.stringify(data) }),

  sign: (id: string, signatureBase64: string) =>
    request<any>(`/contracts/${id}/sign`, { method: 'POST', body: JSON.stringify({ signatureBase64 }) }),

  downloadPdf: async (id: string) => {
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(`${API_URL}/contracts/${id}/pdf`, { headers });
    if (!res.ok) throw new ApiError(res.status, 'PDF download failed');
    return res.blob();
  },

  complete: (id: string) =>
    request<any>(`/contracts/${id}/complete`, { method: 'PATCH' }),

  cancel: (id: string) =>
    request<any>(`/contracts/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Conditions API ────────────────────────────────────────────
export const conditionsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/conditions${qs}`);
  },

  getById: (id: string) =>
    request<any>(`/conditions/${id}`),

  create: (formData: FormData) =>
    uploadRequest<any>('/conditions', formData),

  update: (id: string, formData: FormData) =>
    uploadRequest<any>(`/conditions/${id}`, formData, 'PATCH'),

  compare: (contractId: string) =>
    request<any>(`/conditions/compare/${contractId}`),
};

// ─── Partners API ──────────────────────────────────────────────
export const partnersApi = {
  register: (data: any) =>
    request<any>('/partners/register', { method: 'POST', body: JSON.stringify(data) }),

  getMyProfile: () =>
    request<any>('/partners/me'),

  updateMyProfile: (data: any) =>
    request<any>('/partners/me', { method: 'PUT', body: JSON.stringify(data) }),

  getDashboard: () =>
    request<any>('/partners/me/dashboard'),

  getMyVehicles: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners/me/vehicles${qs}`);
  },

  submitVehicle: (data: any) =>
    request<any>('/partners/me/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  getMyReservations: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners/me/reservations${qs}`);
  },

  getMyPayouts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners/me/payouts${qs}`);
  },

  // Admin endpoints
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/partners${qs}`);
  },

  getById: (id: string) =>
    request<any>(`/partners/${id}`),

  adminUpdate: (id: string, data: any) =>
    request<any>(`/partners/${id}/admin`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Verification API ──────────────────────────────────────────
export const verificationApi = {
  getQueue: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/verification/queue${qs}`);
  },

  getReinspectionDue: () =>
    request<any>('/verification/reinspection-due'),

  getVehicleSteps: (vehicleId: string) =>
    request<any>(`/verification/vehicles/${vehicleId}/steps`),

  advanceStep: (vehicleId: string, data: any) =>
    request<any>(`/verification/vehicles/${vehicleId}/steps`, { method: 'POST', body: JSON.stringify(data) }),

  scoreVehicle: (vehicleId: string, data: any) =>
    request<any>(`/verification/vehicles/${vehicleId}/score`, { method: 'POST', body: JSON.stringify(data) }),

  overrideVerification: (vehicleId: string, data: any) =>
    request<any>(`/verification/vehicles/${vehicleId}/override`, { method: 'POST', body: JSON.stringify(data) }),

  recordInspection: (vehicleId: string, data: any) =>
    request<any>(`/verification/inspections/${vehicleId}`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Reviews API ───────────────────────────────────────────────
export const reviewsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/reviews${qs}`);
  },

  create: (data: any) =>
    request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  respond: (id: string, data: { response: string }) =>
    request<any>(`/reviews/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),

  moderate: (id: string, data: { isPublished: boolean }) =>
    request<any>(`/reviews/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Payouts API ───────────────────────────────────────────────
export const payoutsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/payouts${qs}`);
  },

  generate: () =>
    request<any>('/payouts/generate', { method: 'POST' }),

  process: (id: string, data: any) =>
    request<any>(`/payouts/${id}/process`, { method: 'PATCH', body: JSON.stringify(data) }),

  markPaid: (id: string, data: any) =>
    request<any>(`/payouts/${id}/paid`, { method: 'PATCH', body: JSON.stringify(data) }),

  markFailed: (id: string, data: any) =>
    request<any>(`/payouts/${id}/failed`, { method: 'PATCH', body: JSON.stringify(data) }),

  createManual: (data: any) =>
    request<any>('/payouts/manual', { method: 'POST', body: JSON.stringify(data) }),

  partnerSummary: (partnerId: string) =>
    request<any>(`/payouts/partner/${partnerId}/summary`),
};

// ─── Notifications API ─────────────────────────────────────────
export const notificationsApi = {
  list: () =>
    request<any>('/notifications'),

  markRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request<void>('/notifications/read-all', { method: 'PATCH' }),
};

// ─── Admin API (aggregated dashboard) ──────────────────────────
export const adminApi = {
  getDashboard: () =>
    request<any>('/admin/dashboard'),

  getActivityLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/activity-logs${qs}`);
  },

  getSettings: () =>
    request<any>('/settings'),

  updateSetting: (key: string, value: string) =>
    request<any>(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
};
