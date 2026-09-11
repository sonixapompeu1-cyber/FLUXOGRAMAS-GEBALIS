import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, AlertTriangle, X, CheckCircle2, Lock, User, FileText } from 'lucide-react';
import { IdentityGateState } from '../types';
import { GPSEngine } from '../engine/gpsEngine';

interface IdentityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateState: IdentityGateState;
  onUpdateGateState: (newState: IdentityGateState) => void;
  onAuthorizedSuccess?: () => void;
}

export const IdentityGateModal: React.FC<IdentityGateModalProps> = ({
  isOpen,
  onClose,
  gateState,
  onUpdateGateState,
  onAuthorizedSuccess
}) => {
  const [nifInput, setNifInput] = useState(gateState.nif || '123456789');
  const [birthDateInput, setBirthDateInput] = useState(gateState.dataNascimento || '1975-04-12');
  const [interlocutorIdx, setInterlocutorIdx] = useState(gateState.interlocutorIndex ?? 0);
  const [hasProcuracao, setHasProcuracao] = useState(gateState.possuiProcuracao);

  if (!isOpen) return null;

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = GPSEngine.validateIdentityGate(
      gateState,
      nifInput,
      birthDateInput,
      interlocutorIdx,
      hasProcuracao
    );
    onUpdateGateState(result);

    if (result.status === 'AUTORIZADO' && onAuthorizedSuccess) {
      onAuthorizedSuccess();
    }
  };

  const handleReset = () => {
    onUpdateGateState(GPSEngine.createDefaultIdentityGate());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-gate-title"
        className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E62382] flex items-center justify-center text-white font-bold shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="identity-gate-title" className="text-lg font-bold font-serif text-white tracking-tight">
                Gate de Identidade & RGPD
              </h2>
              <p className="text-xs text-slate-300">
                Verificação de Legitimidade Operacional (Página 3: 2 val — Fluxograma Vision)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Alert */}
          {gateState.status === 'AUTORIZADO' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Acesso Autorizado ao GPS Operacional
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Interlocutor autenticado com poderes contratuais. Procedimentos de atendimento liberados nos termos do RGPD.
                </p>
              </div>
            </div>
          )}

          {gateState.status === 'BLOQUEADO' && (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">
                  BLOQUEIO OPERACIONAL — ATENDIMENTO NÃO AUTORIZADO
                </p>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {gateState.motivoBloqueio}
                </p>
                <div className="mt-2.5 p-2 bg-white/80 border border-rose-200 rounded text-[11px] text-rose-800 font-mono">
                  Ação mandatória: Solicitar ao interlocutor o envio de procuração com poderes especiais assinada pelo titular para atendimento@gebalis.pt antes de prosseguir.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleValidate} className="space-y-4">
            {/* Step 1: NIF & Data de Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIF do Titular (9 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={9}
                  value={nifInput}
                  onChange={(e) => setNifInput(e.target.value)}
                  placeholder="ex: 123456789"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#E62382] focus:border-[#E62382] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E62382] focus:border-[#E62382] outline-none"
                  required
                />
              </div>
            </div>

            {/* Step 2 & 3: Agregado & Interlocutor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Composição do Agregado Familiar / Quem está ao telefone?
              </label>
              <div className="space-y-2">
                {gateState.membros.map((membro, index) => (
                  <label
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      interlocutorIdx === index
                        ? 'bg-pink-50/60 border-[#E62382] text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="interlocutor"
                        checked={interlocutorIdx === index}
                        onChange={() => setInterlocutorIdx(index)}
                        className="text-[#E62382] focus:ring-[#E62382]"
                      />
                      <div>
                        <p className="text-sm font-medium">{membro.nome}</p>
                        <p className="text-xs text-slate-500">{membro.parentesco} • NIF: {membro.nif || 'N/D'}</p>
                      </div>
                    </div>
                    <div>
                      {membro.autorizado ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Titulado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Exige Procuração
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 4: Procuração / Autorização */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProcuracao}
                  onChange={(e) => setHasProcuracao(e.target.checked)}
                  className="mt-1 rounded text-[#E62382] focus:ring-[#E62382]"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Interlocutor apresenta procuração ou autorização formal de representação
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Obrigatório quando o interlocutor não é o titular ou cônjuge do contrato habitacional.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                Repor valores padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c21869] rounded-lg shadow-sm transition-all"
                >
                  Validar Legitimidade
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
