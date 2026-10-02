import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'lms_batudaa_supabase_url';
const STORAGE_KEY_KEY = 'lms_batudaa_supabase_anon_key';

// Ambil dari .env atau localStorage
export function getSavedCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  const isConfigured = 
    Boolean(url && key) && 
    url.startsWith('https://') && 
    !url.includes('your-project-id') && 
    !url.includes('example.com') &&
    key.length > 20;

  return { url, key, isConfigured };
}

let activeClient: SupabaseClient | null = null;
const { url: initialUrl, key: initialKey, isConfigured: initialConfigured } = getSavedCredentials();

if (initialConfigured) {
  try {
    activeClient = createClient(initialUrl, initialKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Gagal menginisialisasi client Supabase:', err);
    activeClient = null;
  }
}

export const supabase = activeClient;

export function isSupabaseConfigured(): boolean {
  return Boolean(activeClient);
}

export function saveCustomSupabaseCredentials(url: string, key: string): { success: boolean; message: string } {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'URL Supabase harus diawali dengan https://' };
    }
    if (!key || key.length < 20) {
      return { success: false, message: 'Anon Key tidak valid (terlalu pendek)' };
    }

    localStorage.setItem(STORAGE_KEY_URL, url);
    localStorage.setItem(STORAGE_KEY_KEY, key);

    activeClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    return { success: true, message: 'Kredensial Supabase berhasil disimpan! Memuat ulang sesi...' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: 'Error: ' + errorMsg };
  }
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  activeClient = null;
}
