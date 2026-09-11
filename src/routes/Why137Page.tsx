import React from 'react';
import { 
  HelpCircle, Layers, FileSpreadsheet, GitMerge, 
  ShieldAlert, CheckCircle2, ArrowRight, ArrowDown, 
  FileText, Database, Compass, AlertTriangle, ExternalLink
} from 'lucide-react';
import { BENCHMARK_137_AUDIT } from '../reconciliation/benchmarkData';
import { runAutomatedForensicAudit } from '../reconciliation/reconciliationEngine';

interface Why137PageProps {
  onNavigate: (route: string) => void;
}

export const Why137Page: React.FC<Why137PageProps> = ({ onNavigate }) => {
  const audit = runAutomatedForensicAudit();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                Auditoria e Hermenêutica Documental
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Análise Comparativa Forense
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900">
              Porque Existem 137, 14 e 145?
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Esclarecimento metodológico sobre a coexistência das 3 camadas de dados no GEBALIS VISION: 
              a camada gráfica original (145 páginas), a camada estruturada de execução (14 grafos) e a métrica 
              histórica de referência (137 fluxos).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/reconciliacao')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E62382] hover:bg-[#c9186c] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Matriz de Reconciliação</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 3 Data Layers Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Layer A */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                CAMADA A • FONTE GRÁFICA
              </span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold font-mono text-slate-900">145</p>
            <h3 className="text-base font-bold font-serif text-slate-800 mt-1">Páginas Visio</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Exportação integral do Microsoft Visio (<code className="font-mono text-slate-800">Fluxograma_Vision_T1.htm</code>).
              Contém todas as pranchas gráficas desenhadas, incluindo índices, capas, minutas, quadros de valores e desdobramentos operacionais.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Ficheiros: xaml_1.htm a xaml_145.htm
          </div>
        </div>

        {/* Layer B */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-pink-100 text-[#E62382] rounded">
                CAMADA B • FONTE ESTRUTURADA
              </span>
              <Database className="w-4 h-4 text-[#E62382]" />
            </div>
            <p className="text-3xl font-bold font-mono text-slate-900">14</p>
            <h3 className="text-base font-bold font-serif text-slate-800 mt-1">Fluxos Core Interativos</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Estruturas JSON executáveis (<code className="font-mono text-slate-800">flows.json</code>).
              Possuem topologia completa de nós (119), nós de decisão determinísticos (32) e arestas direcionais (111) executadas pelo GPS.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Base de execução em tempo real
          </div>
        </div>

        {/* Layer C */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                CAMADA C • BENCHMARK HISTÓRICO
              </span>
              <HelpCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-bold font-mono text-slate-900">137</p>
            <h3 className="text-base font-bold font-serif text-slate-800 mt-1">Fluxos de Referência</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Número referenciado em relatórios executivos e levantamentos anteriores.
              Corresponde ao total de caminhos/casos de uso ou páginas de processos puros excluindo materiais auxiliares e capas.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Origem documental prévia
          </div>
        </div>
      </div>

      {/* Explanatory Diagram of the Relationship */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <h2 className="text-lg font-bold font-serif text-slate-900">
          Diagrama Explicativo da Relação Forense
        </h2>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            {/* Box 1 */}
            <div className="flex-1 bg-white border border-blue-200 p-4 rounded-lg shadow-xs">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Acervo Gráfico Integral
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-2">145 Páginas Visio</p>
              <p className="text-[11px] text-slate-500 mt-1">Exportação pura do ficheiro original Visio</p>
            </div>

            <ArrowRight className="hidden md:block w-6 h-6 text-slate-400 shrink-0" />
            <ArrowDown className="md:hidden w-6 h-6 text-slate-400" />

            {/* Box 2 */}
            <div className="flex-1 bg-white border border-purple-200 p-4 rounded-lg shadow-xs">
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Classificação Forense
              </span>
              <div className="text-[11px] text-left text-slate-600 space-y-1 mt-2 font-mono">
                <p>• {audit.statusCounts.confirmed} Confirmados 1:1</p>
                <p>• {audit.statusCounts.subflow} Subfluxos/Fases</p>
                <p>• {audit.statusCounts.auxiliary} Minutas/Anexos</p>
                <p>• {audit.statusCounts.index} Capas/Índices</p>
              </div>
            </div>

            <ArrowRight className="hidden md:block w-6 h-6 text-slate-400 shrink-0" />
            <ArrowDown className="md:hidden w-6 h-6 text-slate-400" />

            {/* Box 3 */}
            <div className="flex-1 bg-white border border-pink-200 p-4 rounded-lg shadow-xs">
              <span className="text-xs font-mono font-bold text-[#E62382] bg-pink-50 px-2 py-0.5 rounded">
                Lógica Estruturada
              </span>
              <p className="text-xl font-bold font-mono text-[#E62382] mt-2">14 Fluxos Core</p>
              <p className="text-[11px] text-slate-500 mt-1">119 nós • 32 decisões • 111 arestas</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Princípio de Fidelidade Forense:</strong> Sob nenhuma circunstância a aplicação deve tentar 
            fazer equivaler matematicamente <code className="font-mono font-bold">145 = 137 = 14</code> através de dados fictícios.
            Cada grandeza quantitativa corresponde a uma camada real e auditável do projeto.
          </div>
        </div>
      </div>

      {/* Ficha de Auditoria: 137 — O Que Representa? */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold font-serif text-slate-900">
            Ficha de Auditoria: 137 — O Que Representa?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Classificação</span>
            <p className="text-slate-800 font-medium">{BENCHMARK_137_AUDIT.classification}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Origem Registada</span>
            <p className="text-slate-800 font-medium">{BENCHMARK_137_AUDIT.origin}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg md:col-span-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Contexto Documental</span>
            <p className="text-slate-800 leading-relaxed">{BENCHMARK_137_AUDIT.context}</p>
          </div>
        </div>

        {/* Hypotheses */}
        <div>
          <h3 className="text-sm font-bold font-serif text-slate-800 mb-3">
            Hipóteses de Reconciliação Forense
          </h3>
          <div className="space-y-3">
            {BENCHMARK_137_AUDIT.hypotheses.map((h, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">{h.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    h.plausibility === 'ALTA' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Plausibilidade: {h.plausibility}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning and Conclusion */}
        <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
          <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono">
            <p className="text-amber-400 font-bold mb-1">[ADVERTÊNCIA FORMAL]</p>
            <p>{BENCHMARK_137_AUDIT.warning}</p>
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong>Conclusão do Relatório:</strong> {BENCHMARK_137_AUDIT.conclusion}
          </p>
        </div>
      </div>
    </div>
  );
};
