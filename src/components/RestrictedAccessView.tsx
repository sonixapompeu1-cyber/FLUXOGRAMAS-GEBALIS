import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';
import { AdminLoginModal } from './AdminLoginModal';

interface RestrictedAccessViewProps {
  onNavigateToGallery: () => void;
  onAuthenticated: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  onNavigateToGallery,
  onAuthenticated,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-2xl bg-pink-50 border border-pink-200 text-[#E62382] flex items-center justify-center mx-auto shadow-xs">
        <Lock className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
          <ShieldAlert className="w-3.5 h-3.5" />
          ACESSO RESTRITO
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
          Área exclusiva do Administrador.
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Os módulos técnicos de operação, validação, simulação e governação estão protegidos por credencial de segurança.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onNavigateToGallery}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Galeria</span>
        </button>

        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-50 border border-pink-200 text-[#E62382] font-bold text-sm hover:bg-pink-100 transition-colors shadow-2xs"
        >
          <KeyRound className="w-4 h-4" />
          <span>Autenticar como Administrador</span>
        </button>
      </div>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          onAuthenticated();
        }}
      />
    </div>
  );
};
