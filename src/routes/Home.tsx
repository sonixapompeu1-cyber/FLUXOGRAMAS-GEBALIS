import React, { useState } from 'react';
import { Flow, FlowArea, IdentityGateState } from '../types';
import { GRANDEZAS } from '../data/grandezas';
import { VISIO_REGISTRY } from '../data/visioRegistry';
import {
  GitFork,
  ArrowRight,
  Search,
  PhoneCall,
  Receipt,
  Wrench,
  Users,
  Home as HomeIcon,
  Building2,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Lock,
  Compass,
  FlaskConical,
  FileText,
  ShieldCheck,
  CreditCard,
  Store,
  Scale,
  GitMerge,
  Activity
} from 'lucide-react';

interface HomeProps {
  flows: Flow[];
  areas: FlowArea[];
  onNavigate: (path: string) => void;
  gateState: IdentityGateState;
  onOpenGateModal: () => void;
}

export const Home: React.FC<HomeProps> = ({ 
  flows, 
  areas, 
  onNavigate, 
  gateState,
  onOpenGateModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const initialFlow = flows.find((f) => f.slug === 'triagem-inicial') || flows[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/fluxos?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/fluxos');
    }
  };

  const getGrandezaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#E62382]" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5 text-[#8CBD45]" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-[#379C8D]" />;
      case 'Store':
        return <Store className="w-5 h-5 text-[#0284C7]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#E62382]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#6366F1]" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5 text-[#10B981]" />;
      case 'Home':
        return <HomeIcon className="w-5 h-5 text-[#F59E0B]" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#8B5CF6]" />;
      case 'Compass':
      default:
        return <Compass className="w-5 h-5 text-[#0D9488]" />;
    }
  };

  const totalNodes = flows.reduce((acc, f) => acc + f.nodes.length, 0);
  const totalEdges = flows.reduce((acc, f) => acc + f.edges.length, 0);

  return (
    <div id="home-page" className="min-h-screen flex flex-col space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section
        id="hero-banner"
        className="relative bg-white border-b border-slate-200/80 pt-12 pb-14 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#181717 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-5">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E62382] text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#E62382]" />
              <span>GEBALIS VISION · Reconstrução Forense V4</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-serif leading-tight">
              Fluxos Operacionais & Motor GPS de Decisão
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl">
              Ambiente determinístico de triagem telefónica, navegação nó-a-nó e auditoria estrutural para os operadores do <strong className="text-slate-900 font-semibold">Contact Center da GEBALIS</strong>.
            </p>

            {/* Fast Global Search Form */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
              <div className="relative flex items-center shadow-xs rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-[#E62382] transition-colors">
                <Search className="w-5 h-5 text-slate-400 absolute left-4" />
                <input
                  type="text"
                  placeholder="Pesquisar por assunto, avaria, renda, nó, página Visio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-lg bg-[#E62382] text-white text-xs font-bold shadow-xs hover:bg-[#c9186d] transition-colors"
                >
                  Pesquisar
                </button>
              </div>
            </form>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate(`/flows/${initialFlow.slug}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-[#E62382] transition-colors shadow-xs"
              >
                <Compass className="w-4 h-4 text-[#E62382]" />
                <span>Iniciar GPS de Atendimento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenGateModal}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-bold transition-colors ${
                  gateState.status === 'AUTORIZADO'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#E62382]" />
                <span>Gate de Identidade ({gateState.status === 'AUTORIZADO' ? 'Autorizado' : 'Validar'})</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/operacao')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E62382] text-white font-bold hover:bg-[#c9186d] transition-colors shadow-xs"
              >
                <Activity className="w-4 h-4 text-white" />
                <span>Centro de Operação (V9)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/prontidao-operacional')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#8CBD45]" />
                <span>Prontidão Operacional (V8)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/validacao-operacional')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 border border-pink-200 text-[#E62382] font-bold hover:bg-pink-100 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-[#E62382]" />
                <span>Validação Operacional (V6)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/remediacao')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <GitMerge className="w-4 h-4 text-emerald-600" />
                <span>Governação & Remediação (V7)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/galeria')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Galeria 145 Fluxogramas</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/laboratorio')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>Laboratório de Teste</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Forensic Summary Bar (3 Layers: 145 x 14 x 137) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-7 shadow-md border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8CBD45]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#8CBD45]">
                  Arquitetura de Reconciliação Forense (V5)
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
                Três Camadas Documentais Independentes · Princípio "Não Inventar"
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Cada camada é apresentada com a sua proveniência documental estrita, sem forçar coincidências artificiais. 
                Auditoria contínua entre as pranchas gráficas originais, os grafos JSON de decisão determinística e o referencial histórico.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('/prontidao-operacional')}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Prontidão Operacional V8</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/simulador')}
                className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Simulador Operacional</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/validacao-operacional')}
                className="px-4 py-2.5 rounded-lg bg-[#8CBD45] hover:bg-[#7aa73b] text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Validação V6</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/reconciliacao')}
                className="px-4 py-2.5 rounded-lg bg-[#E62382] hover:bg-[#c9186d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Matriz de Reconciliação</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/porque-137')}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
              >
                <span>Porquê 137?</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-6">
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block mb-1">
                Camada A · Gráfica
              </span>
              <p className="text-2xl lg:text-3xl font-bold font-mono text-white">145</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">Páginas Visio</p>
              <p className="text-[10px] text-slate-400 mt-1">Exportação integral Fluxograma_Vision_T1</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left">
              <span className="text-[10px] font-mono text-[#E62382] uppercase font-bold block mb-1">
                Camada B · Estruturada
              </span>
              <p className="text-2xl lg:text-3xl font-bold font-mono text-[#E62382]">{flows.length}</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">Fluxos Core no flows.json</p>
              <p className="text-[10px] text-slate-400 mt-1">119 nós · 32 decisões · 111 arestas</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                Camada C · Histórica
              </span>
              <p className="text-2xl lg:text-3xl font-bold font-mono text-amber-400">137</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">Benchmark Histórico</p>
              <p className="text-[10px] text-slate-400 mt-1">Referencial anterior / documental</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left">
              <span className="text-[10px] font-mono text-[#8CBD45] uppercase font-bold block mb-1">
                Institucional
              </span>
              <p className="text-2xl lg:text-3xl font-bold font-mono text-[#8CBD45]">10</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">Grandezas Oficiais</p>
              <p className="text-[10px] text-slate-400 mt-1">Edificado, Rendas, Social, etc.</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                Integridade Operacional
              </span>
              <p className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400">100%</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">12 Testes Auditados</p>
              <p className="text-[10px] text-slate-400 mt-1">0 arestas soltas · 0 nós órfãos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: AS 10 GRANDEZAS OFICIAIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-[#E62382] uppercase tracking-wider block">
              Estrutura Institucional GEBALIS
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-serif">
              As 10 Grandezas Operacionais
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organização temática e funcional de todos os procedimentos de atendimento e manutenção municipal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/fluxos')}
            className="text-xs font-bold text-[#E62382] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver Catálogo Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Grandezas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {GRANDEZAS.map((g) => {
            const flowCount = g.flowSlugs.length;
            const visioCount = g.visioPageIndices.length;

            return (
              <div
                key={g.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${g.color}15` }}
                    >
                      {getGrandezaIcon(g.iconName)}
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {g.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-serif text-slate-900 group-hover:text-[#E62382] transition-colors">
                    {g.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {g.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500">
                    {visioCount} págs Visio
                  </span>

                  <button
                    onClick={() => {
                      if (g.flowSlugs.length > 0) {
                        onNavigate(`/flows/${g.flowSlugs[0]}`);
                      } else {
                        onNavigate(`/galeria`);
                      }
                    }}
                    className="font-bold text-[#E62382] hover:underline flex items-center gap-0.5"
                  >
                    <span>Abrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Flows Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-[#379C8D] uppercase tracking-wider block">
              Atalhos Rápidos
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Fluxogramas de Alta Frequência Operacional
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.slice(0, 6).map((flow) => (
            <button
              key={flow.slug}
              type="button"
              onClick={() => onNavigate(`/flows/${flow.slug}`)}
              className="text-left bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-[#E62382] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {flow.slug}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {flow.nodes.length} nós
                  </span>
                </div>

                <h3 className="text-sm font-bold font-serif text-slate-900 group-hover:text-[#E62382] transition-colors">
                  {flow.name}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#E62382] font-bold">
                <span>Executar no GPS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
