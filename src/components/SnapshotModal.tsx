import React, { useState } from 'react';
import { AuditSnapshot, OperationalValidationReport } from '../types';
import { 
  getAllSnapshots, 
  saveSnapshotFromReport, 
  compareSnapshots, 
  SnapshotComparison 
} from '../validation/snapshotManager';
import { 
  X, 
  Camera, 
  History, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  TrendingUp,
  Save
} from 'lucide-react';

interface SnapshotModalProps {
  report: OperationalValidationReport;
  onClose: () => void;
  onSnapshotCreated?: () => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  report,
  onClose,
  onSnapshotCreated
}) => {
  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>(getAllSnapshots());
  const [tab, setTab] = useState<'list' | 'create' | 'compare'>('list');
  const [customName, setCustomName] = useState('');
  const [notes, setNotes] = useState('');

  // For comparison
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<string>(snapshots[0]?.id || '');
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<string>(snapshots[1]?.id || snapshots[0]?.id || '');
  const [comparison, setComparison] = useState<SnapshotComparison | null>(null);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    saveSnapshotFromReport(report, customName || undefined, notes || undefined);
    const updated = getAllSnapshots();
    setSnapshots(updated);
    setTab('list');
    setCustomName('');
    setNotes('');
    if (onSnapshotCreated) onSnapshotCreated();
  };

  const handleRunComparison = () => {
    const a = snapshots.find(s => s.id === selectedSnapshotA);
    const b = snapshots.find(s => s.id === selectedSnapshotB);
    if (a && b) {
      const result = compareSnapshots(a, b);
      setComparison(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#E62382]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                Snapshots & Deteção de Regressões V6
              </span>
            </div>
            <h3 className="text-lg font-bold font-serif text-white mt-0.5">
              Histórico de Auditorias e Comparação de Versões
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setTab('list')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'list'
                ? 'border-[#E62382] text-[#E62382]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Snapshots Existentes ({snapshots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('create')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'create'
                ? 'border-[#E62382] text-[#E62382]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Criar Novo Snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('compare');
              if (snapshots.length >= 2) {
                handleRunComparison();
              }
            }}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'compare'
                ? 'border-[#E62382] text-[#E62382]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparar Auditorias</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          
          {tab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Os snapshots guardam o estado exato das métricas, flows, nós e achados sem alterar o estado de produção.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className="px-3 py-1.5 bg-[#E62382] hover:bg-[#c9186d] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Gravar Estado Atual</span>
                </button>
              </div>

              <div className="space-y-3">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          {snap.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{snap.name}</h4>
                      </div>
                      <span className="font-mono text-xs text-slate-500">{snap.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase">Total Flows</span>
                        <strong className="text-slate-900 font-mono text-sm">{snap.totalFlows}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-emerald-600 block uppercase font-bold">Conformes</span>
                        <strong className="text-emerald-700 font-mono text-sm">{snap.conformeCount}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-amber-600 block uppercase font-bold">Divergentes</span>
                        <strong className="text-amber-700 font-mono text-sm">{snap.divergenteCount}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-purple-600 block uppercase font-bold">Inconclusivos</span>
                        <strong className="text-purple-700 font-mono text-sm">{snap.inconclusivoCount}</strong>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase">Achados</span>
                        <strong className="text-slate-900 font-mono text-sm">{snap.findingsTotal}</strong>
                      </div>
                    </div>

                    {snap.notes && (
                      <p className="text-xs text-slate-600 italic pt-1">
                        Nota: {snap.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'create' && (
            <form onSubmit={handleCreateSnapshot} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome do Snapshot
                </label>
                <input
                  type="text"
                  placeholder="ex: Auditoria Trimestral Q3 — V6 Estável"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Notas de Contexto
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o motivo deste snapshot (ex.: antes de atualização de parâmetros ou deliberação CA)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#E62382]"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Dados a serem capturados:</span>
                </p>
                <p className="text-[11px]">
                  14 Flows · 145 Páginas Visio · {report.conformeFlowsCount} Conformes · {report.divergenteFlowsCount} Divergentes · {report.totalFindings} Achados de Auditoria.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E62382] hover:bg-[#c9186d] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  Criar e Guardar Snapshot
                </button>
                <button
                  type="button"
                  onClick={() => setTab('list')}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {tab === 'compare' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Snapshot A (Referência Anterior)
                    </label>
                    <select
                      value={selectedSnapshotA}
                      onChange={(e) => setSelectedSnapshotA(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {snapshots.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Snapshot B (Auditoria Recente)
                    </label>
                    <select
                      value={selectedSnapshotB}
                      onChange={(e) => setSelectedSnapshotB(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {snapshots.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunComparison}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Comparar
                </button>
              </div>

              {comparison && (
                <div className="space-y-4">
                  {/* High level Diff Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Conformes</span>
                      <p className="text-lg font-bold font-mono text-slate-900 flex items-center gap-1">
                        <span>{comparison.snapshotB.conformeCount}</span>
                        <span className={`text-xs font-semibold ${comparison.conformeDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ({comparison.conformeDiff >= 0 ? `+${comparison.conformeDiff}` : comparison.conformeDiff})
                        </span>
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Divergentes</span>
                      <p className="text-lg font-bold font-mono text-slate-900 flex items-center gap-1">
                        <span>{comparison.snapshotB.divergenteCount}</span>
                        <span className={`text-xs font-semibold ${comparison.divergenteDiff <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ({comparison.divergenteDiff > 0 ? `+${comparison.divergenteDiff}` : comparison.divergenteDiff})
                        </span>
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Achados Totais</span>
                      <p className="text-lg font-bold font-mono text-slate-900 flex items-center gap-1">
                        <span>{comparison.snapshotB.findingsTotal}</span>
                        <span className={`text-xs font-semibold ${comparison.findingsDiff <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ({comparison.findingsDiff > 0 ? `+${comparison.findingsDiff}` : comparison.findingsDiff})
                        </span>
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Alerta de Regressão</span>
                      <p className="text-xs font-bold mt-1">
                        {comparison.flowChanges.some(c => c.hasRegression) ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            REGRESSÃO DETETADA
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sem Regressões
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Flow by Flow change table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Flow Slug</th>
                          <th className="p-2.5">Score Snapshot A</th>
                          <th className="p-2.5">Score Snapshot B</th>
                          <th className="p-2.5">Variação</th>
                          <th className="p-2.5">Estado A → B</th>
                          <th className="p-2.5">Diagnóstico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {comparison.flowChanges.map(change => (
                          <tr key={change.flowSlug} className={change.hasRegression ? 'bg-red-50/60' : 'bg-white'}>
                            <td className="p-2.5 font-mono font-semibold text-slate-900">{change.flowSlug}</td>
                            <td className="p-2.5 font-mono">{change.scoreA}%</td>
                            <td className="p-2.5 font-mono font-bold">{change.scoreB}%</td>
                            <td className="p-2.5 font-mono">
                              {change.scoreDiff > 0 && <span className="text-emerald-600">+{change.scoreDiff}%</span>}
                              {change.scoreDiff < 0 && <span className="text-red-600">{change.scoreDiff}%</span>}
                              {change.scoreDiff === 0 && <span className="text-slate-400">0%</span>}
                            </td>
                            <td className="p-2.5 uppercase font-bold text-[10px]">
                              {change.statusA} → {change.statusB}
                            </td>
                            <td className="p-2.5">
                              {change.hasRegression ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                  REGRESSÃO DETETADA
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Estável / Melhorado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
