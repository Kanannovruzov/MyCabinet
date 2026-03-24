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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Mobile': '1',
    ...(options.headers as Record<string, string> || {}),
  };

  if (_pin) headers['X-Pin'] = _pin;
  if (_session) headers['X-Session'] = _session;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
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
  adi_az?: string;
  soyadi_az?: string;
  ata_adi?: string;
  adi?: string;
  soyadi?: string;
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
    apiFetch<{ ok: boolean; items: CertItem[] }>('/mobile/certificates'),

  certificate: (id: number) =>
    apiFetch<{ ok: boolean; item: CertItem }>(`/mobile/certificates/${id}`),

  profile: (manId: number) =>
    apiFetch<{ ok: boolean; item: ProfileItem }>(`/welcome/profile/${manId}`),

  services: () =>
    apiFetch<{ ok: boolean; items: ServiceItem[] }>('/mobile/services'),

  allServices: () =>
    apiFetch<{ ok: boolean; items: ServiceItem[] }>('/mobile/getAllServices'),

  notifications: () =>
    apiFetch<{ ok: boolean; items: NotifItem[]; unread: number }>('/mobile/notifications'),

  markRead: (id: number) =>
    apiFetch<{ ok: boolean }>(`/mobile/notifications/read/${id}`, { method: 'POST' }),

  markAllRead: () =>
    apiFetch<{ ok: boolean }>('/mobile/notifications/read-all', { method: 'POST' }),

  feedbackSend: (topic: string, message: string) =>
    apiFetch<{ ok: boolean; msg: string }>('/mobile/feedback/send', {
      method: 'POST',
      body: JSON.stringify({ topic, message }),
    }),

  trainings: () =>
    apiFetch<{ ok: boolean; items: any[] }>('/mobile/trainings'),

  documents: () =>
    apiFetch<{ ok: boolean; items: any[] }>('/mobile/documents'),

  checkFin: (fin: string) =>
    apiFetch<{ ok: boolean; pin?: string; name_az?: string; name_en?: string; seaman_id?: string; photo_url?: string; msg?: string }>('/mobile/check-fin', {
      method: 'POST',
      body: JSON.stringify({ fin }),
    }),

  profile: () =>
    apiFetch<{ ok: boolean; item: ProfileItem }>('/mobile/profile'),
};
