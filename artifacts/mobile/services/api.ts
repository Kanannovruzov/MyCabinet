const BASE_URL = 'https://seafarer.ddla.gov.az';

let _pin: string | null = null;
let _session: string | null = null;

export function setApiAuth(pin: string, session: string) {
  _pin = pin;
  _session = session;
}

export function clearApiAuth() {
  _pin = null;
  _session = null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Mobile': '1',
      ...((_pin && _session) ? { 'X-Pin': _pin, 'X-Session': _session } : {}),
      ...(options.headers || {}),
    },
  });
  return res.json();
}

export type CertItem = {
  id: number;
  cert_name: string;
  code: string;
  sub: string;
  start: string;
  end: string;
  days_left: number | null;
  days_label: string | number;
  percent: number;
  status: string;
  url_pdf: string;
};

export type ProfileItem = {
  unikal: number;
  name_az: string;
  name_en: string;
  gender: string;
  dob: string;
  ind_num: string;
  email: string;
  phone1: string;
  phone2: string;
  fin: string;
  crew: string;
  org: string;
  online: string;
  seaman_id: string;
  seaman_issue: string;
  seaman_valid: string;
};

export type NotifItem = {
  id: number;
  title: string;
  body: string;
  url: string;
  type: string;
  priority: number;
  created_at: string;
  is_read: number;
};

export type ServiceItem = {
  id: number;
  name: string;
  url: string;
};

export const api = {
  certificates: () =>
    apiFetch<{ ok: boolean; items: CertItem[] }>('/api/certificates'),

  certificate: (id: number) =>
    apiFetch<{ ok: boolean; item: CertItem }>(`/api/certificates/${id}`),

  profile: (manId: number) =>
    apiFetch<{ ok: boolean; item: ProfileItem }>(`/welcome/profile/${manId}`),

  services: () =>
    apiFetch<{ ok: boolean; items: ServiceItem[] }>('/api/services'),

  notifications: () =>
    apiFetch<{ ok: boolean; items: NotifItem[]; unread: number }>('/api/notifications'),

  markRead: (id: number) =>
    apiFetch<{ ok: boolean }>(`/api/notifications/read/${id}`, { method: 'POST' }),

  markAllRead: () =>
    apiFetch<{ ok: boolean }>('/api/notifications/read-all', { method: 'POST' }),

  feedbackSend: (topic: string, message: string) =>
    apiFetch<{ ok: boolean; msg: string }>('/api/feedback/send', {
      method: 'POST',
      body: JSON.stringify({ topic, message }),
    }),

  trainings: () =>
    apiFetch<{ ok: boolean; items: any[] }>('/api/trainings'),

  checkFin: (fin: string) =>
    apiFetch<{ ok: boolean; session?: string; pin?: string; msg?: string }>('/api/auth/check-fin', {
      method: 'POST',
      body: JSON.stringify({ fin }),
    }),
};
