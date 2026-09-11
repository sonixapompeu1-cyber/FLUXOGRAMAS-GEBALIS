import React from 'react';
import { InstitutionalStripe } from './InstitutionalStripe';
import { GebalisLogo } from './GebalisLogo';
import { ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  // Format current date in Portuguese: "9 de setembro de 2026"
  const formattedDate = new Intl.DateTimeFormat('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <footer id="site-footer" className="bg-[#181717] text-white mt-auto border-t border-slate-800">
      {/* Top 3-segment institutional stripe */}
      <InstitutionalStripe height="h-1.5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <GebalisLogo size="sm" className="brightness-125 filter" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              <strong className="text-white font-semibold">Fluxogramas - Contact Center</strong>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              GEBALIS — Gestão do Arrendamento da Habitação Municipal de Lisboa, E.M., S.A.
              Sistema interno de suporte operacional à decisão e encaminhamento de processos.
            </p>
          </div>

          {/* Institutional Contacts */}
          <div className="space-y-2 text-xs text-slate-400">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Canais Oficiais
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#8CBD45] shrink-0" />
              <span>Linha de Apoio ao Morador: <strong className="text-white">218 800 000</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#379C8D] shrink-0" />
              <span>Email: <strong className="text-white">contactcenter@gebalis.pt</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#E62382] shrink-0" />
              <span>Sede: Av. Eng.º Arantes e Oliveira, n.º 3, 1900-221 Lisboa</span>
            </div>
          </div>

          {/* System Status & Timestamp */}
          <div className="md:text-right space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#8CBD45] animate-pulse" />
              <span>Contact Center Operacional</span>
            </div>
            <div className="text-xs text-slate-400 pt-1">
              Versão Oficial: <span className="text-white font-medium capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#379C8D]" />
              <span>Conformidade com Regulamento Municipal de Habitação</span>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            © {new Date().getFullYear()} GEBALIS E.M. Todos os direitos reservados.
          </span>
          <span className="text-slate-400">
            Fluxogramas - Contact Center · Lisboa
          </span>
        </div>
      </div>
    </footer>
  );
};
