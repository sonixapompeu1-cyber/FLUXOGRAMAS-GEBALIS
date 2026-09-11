import React, { useState } from 'react';
import { Lock, X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../auth/adminAuthStore';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = loginAdmin(password);
    setIsSubmitting(false);

    if (result.success) {
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Palavra-passe incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E62382] flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-white">
                Acesso de Administrador
              </h2>
              <p className="text-xs text-slate-400">
                Área técnica e de governação da GEBALIS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl">
            Introduza a palavra-passe institucional para aceder ao editor de fluxogramas, motor de GPS, auditoria e ferramentas de gestão operacional.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Palavra-passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Digite a palavra-passe"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E62382] focus:border-[#E62382] outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186d] disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ENTRAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
