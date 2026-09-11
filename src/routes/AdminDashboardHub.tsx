import React from 'react';
import { 
  Compass, ShieldCheck, Wrench, CheckCircle2, Play, Activity, 
  GitBranch, RefreshCw, BarChart2, AlertTriangle, MessageSquare, 
  TrendingUp, FileText, ArrowRight, Eye, Sparkles, Layers, 
  CheckSquare, Award, Lock, ExternalLink
} from 'lucide-react';

interface AdminDashboardHubProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardHub: React.FC<AdminDashboardHubProps> = ({ onNavigate }) => {
  const sections = [
    {
      category: 'CONTEÚDO',
      color: 'border-pink-500',
      badgeBg: 'bg-pink-50 text-[#E62382]',
      items: [
        {
          title: 'Galeria dos 145 Fluxogramas',
          description: 'Catálogo completo e imutável das pranchas Visio originais e indexação.',
          path: '/galeria',
          icon: Eye,
          highlight: false,
        },
        {
          title: 'Editor de Fluxogramas',
          description: 'Edição sincronizada do FlowModel: Vista Gráfica, Versão Textual, Validação e Publicação.',
          path: '/admin/editor',
          icon: Layers,
          highlight: true,
        },
      ],
    },
    {
      category: 'GPS',
      color: 'border-[#8CBD45]',
      badgeBg: 'bg-emerald-50 text-[#8CBD45]',
      items: [
        {
          title: 'GPS Operacional',
          description: 'Motor de navegação assistida passo a passo para o Contact Center e técnicos.',
          path: '/fluxos',
          icon: Compass,
          highlight: false,
        },
      ],
    },
    {
      category: 'VALIDAÇÃO',
      color: 'border-teal-500',
      badgeBg: 'bg-teal-50 text-[#379C8D]',
      items: [
        {
          title: 'Reconciliação',
          description: 'Auditoria de paridade estrutural entre os 145 diagramas Visio e os fluxos do sistema.',
          path: '/reconciliacao',
          icon: ShieldCheck,
          highlight: false,
        },
        {
          title: 'Validação Operacional',
          description: 'Matriz de conformidade, cobertura de regras e deteção de divergências.',
          path: '/validacao-operacional',
          icon: CheckCircle2,
          highlight: false,
        },
        {
          title: 'Remediação',
          description: 'Planos de ação técnica (REM), waivers executivos e resolução de inconformidades.',
          path: '/remediacao',
          icon: Wrench,
          highlight: false,
        },
      ],
    },
    {
      category: 'OPERAÇÃO',
      color: 'border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700',
      items: [
        {
          title: 'Prontidão Operacional',
          description: 'Checklists de Go-Live, gates de qualidade, testes e certificação.',
          path: '/prontidao-operacional',
          icon: Activity,
          highlight: false,
        },
        {
          title: 'Operação (Cockpit)',
          description: 'Painel em tempo real de atendimentos, incidentes e gestão de tráfego.',
          path: '/operacao',
          icon: BarChart2,
          highlight: false,
        },
        {
          title: 'Simulador',
          description: 'Simulação guiada de chamadas, testes de percursos e estresse operacional.',
          path: '/simulador',
          icon: Play,
          highlight: false,
        },
      ],
    },
    {
      category: 'GOVERNAÇÃO',
      color: 'border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      items: [
        {
          title: 'Auditoria (Relatório V7)',
          description: 'Certificado executivo de validação, registos de conformidade e change audit.',
          path: '/relatorio',
          icon: FileText,
          highlight: false,
        },
        {
          title: 'Incidentes',
          description: 'Registo e acompanhamento de exceções operacionais durante o atendimento.',
          path: '/operacao?tab=incidentes',
          icon: AlertTriangle,
          highlight: false,
        },
        {
          title: 'Feedback',
          description: 'Sugestões e notas dos operadores de Contact Center da GEBALIS.',
          path: '/operacao?tab=cockpit',
          icon: MessageSquare,
          highlight: false,
        },
        {
          title: 'Melhorias',
          description: 'Ciclo de otimização contínua de procedimentos e textos.',
          path: '/operacao?tab=melhorias',
          icon: TrendingUp,
          highlight: false,
        },
        {
          title: 'Drift Processual',
          description: 'Monitorização contínua de desvios entre procedimentos desenhados e executados.',
          path: '/operacao?tab=drift',
          icon: RefreshCw,
          highlight: false,
        },
      ],
    },
    {
      category: 'RELEASE',
      color: 'border-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700',
      items: [
        {
          title: 'Releases & Versões',
          description: 'Versionamento semântico, changelog oficial e histórico de implantação.',
          path: '/prontidao-operacional?tab=releases',
          icon: GitBranch,
          highlight: false,
        },
        {
          title: 'Bateria de Testes',
          description: 'Execução de testes automatizados e cenários de homologação.',
          path: '/prontidao-operacional?tab=testes',
          icon: CheckSquare,
          highlight: false,
        },
        {
          title: 'Certificação Final',
          description: 'Aprovação formal pela Direção de Atendimento e Gestão do Parque Habitacional.',
          path: '/prontidao-operacional?tab=certificacao',
          icon: Award,
          highlight: false,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E62382] text-white mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Painel de Controlo do Administrador</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
              Administração & Governação — GEBALIS VISION
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Todos os módulos operacionais, validação matemática, motor GPS e edição de fluxogramas centralizados numa visão protegida.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/editor')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E62382] hover:bg-[#c9186d] text-white font-bold text-xs shadow-md transition-all self-start md:self-auto shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Abrir Editor de Fluxogramas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Sections (Requisito 35) */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.category} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md font-mono bg-slate-100 text-slate-700">
                {section.category}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    onClick={() => onNavigate(item.path)}
                    className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                      item.highlight 
                        ? 'border-[#E62382] ring-1 ring-[#E62382]/20 bg-gradient-to-br from-white to-pink-50/30' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          item.highlight ? 'bg-[#E62382] text-white' : 'bg-slate-100 text-slate-700 group-hover:text-slate-900'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {item.highlight && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#E62382] uppercase tracking-wider">
                            Novo Módulo
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E62382] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#E62382] transition-colors">
                      <span>Aceder ao módulo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
