import React, { useState } from 'react';
import { getSavedCredentials, saveCustomSupabaseCredentials, clearCustomSupabaseCredentials } from '../lib/supabaseClient';
import { X, Database, CheckCircle2, AlertTriangle, Key, ExternalLink, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<Props> = ({ isOpen, onClose, onCredentialsUpdated }) => {
  const current = getSavedCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [showKey, setShowKey] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveCustomSupabaseCredentials(url.trim(), key.trim());
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        onCredentialsUpdated();
        onClose();
        window.location.reload();
      }, 900);
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleClearInputs = () => {
    setUrl('');
    setKey('');
    setStatusMessage({ text: 'Kolom input telah dikosongkan. Silakan paste URL & Anon Key baru Anda.', type: 'info' });
  };

  const handleResetToDemo = () => {
    clearCustomSupabaseCredentials();
    setUrl('');
    setKey('');
    setStatusMessage({ text: 'Kredensial tersimpan berhasil dihapus. Aplikasi kembali ke Mode Demo Lokal.', type: 'info' });
    setTimeout(() => {
      onCredentialsUpdated();
      onClose();
      window.location.reload();
    }, 800);
  };

  const copyEnvTemplate = () => {
    const template = `VITE_SUPABASE_URL=${url || 'https://xxxxxxxxxxxx.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}`;
    navigator.clipboard.writeText(template);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ganti Kredensial Supabase</h3>
              <p className="text-xs text-slate-500">Ubah VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Status Koneksi:</span>
            {current.isConfigured ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung ke Cloud
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                Mode Demo Lokal
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearInputs}
            className="text-[11px] font-semibold text-blue-700 hover:underline"
          >
            Kosongkan Kolom
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {statusMessage && (
            <div className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {statusMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />}
              <div>{statusMessage.text}</div>
            </div>
          )}

          {/* VITE_SUPABASE_URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 font-mono">
                VITE_SUPABASE_URL
              </label>
              <span className="text-[11px] text-slate-400">Project URL</span>
            </div>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Contoh: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">https://xxxxxxxxxxxx.supabase.co</code>
            </p>
          </div>

          {/* VITE_SUPABASE_ANON_KEY */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 font-mono">
                VITE_SUPABASE_ANON_KEY
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-1 text-[11px] text-blue-700 hover:underline font-medium"
              >
                {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showKey ? 'Sembunyikan' : 'Tampilkan Kunci'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-xs font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
              <Key className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Dapat disalin dari Supabase Dashboard → <strong>Project Settings → API → anon / public key</strong>
            </p>
          </div>

          {/* Quick copy template box */}
          <div className="rounded-xl bg-blue-50/50 p-3 text-xs border border-blue-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-blue-900 block text-[11px]">Format File .env:</span>
              <code className="text-[11px] text-slate-600 font-mono">VITE_SUPABASE_URL=... / VITE_SUPABASE_ANON_KEY=...</code>
            </div>
            <button
              type="button"
              onClick={copyEnvTemplate}
              className="flex items-center gap-1 rounded-md bg-white border border-blue-200 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition shadow-2xs"
            >
              {copiedEnv ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedEnv ? 'Tersalin!' : 'Salin Format'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition"
              title="Hapus kredensial tersimpan dan kembali ke mode demo"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset ke Demo
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-sm shadow-blue-700/20"
              >
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
