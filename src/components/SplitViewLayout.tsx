import React, { useState } from 'react';
import { Columns, Layout, Minimize2 } from 'lucide-react';
import { OriginalFlowchartViewer } from './OriginalFlowchartViewer';
import { VisioEntry, Flow, GPSPathStep } from '../types';

interface SplitViewLayoutProps {
  visioEntry: VisioEntry;
  matchedFlow: Flow;
  activeGpsNodeId: string;
  gpsComponent: React.ReactNode;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export const SplitViewLayout: React.FC<SplitViewLayoutProps> = ({
  visioEntry,
  matchedFlow,
  activeGpsNodeId,
  gpsComponent,
  onPrevPage,
  onNextPage
}) => {
  const [ratio, setRatio] = useState<'30/70' | '50/50' | '70/30'>('50/50');

  const getWidths = () => {
    switch (ratio) {
      case '30/70':
        return { left: 'w-full lg:w-[32%]', right: 'w-full lg:w-[68%]' };
      case '70/30':
        return { left: 'w-full lg:w-[68%]', right: 'w-full lg:w-[32%]' };
      case '50/50':
      default:
        return { left: 'w-full lg:w-1/2', right: 'w-full lg:w-1/2' };
    }
  };

  const { left, right } = getWidths();

  return (
    <div className="space-y-4">
      {/* Ratio Selector Controls */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Columns className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Visão Dividida Simultânea:</span>
          <span className="text-slate-500">Fluxograma Original Visio (Esquerda) × GPS Operacional (Direita)</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setRatio('30/70')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
              ratio === '30/70' 
                ? 'bg-white text-[#E62382] shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 / 70
          </button>
          <button
            onClick={() => setRatio('50/50')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
              ratio === '50/50' 
                ? 'bg-white text-[#E62382] shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50 / 50
          </button>
          <button
            onClick={() => setRatio('70/30')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
              ratio === '70/30' 
                ? 'bg-white text-[#E62382] shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            70 / 30
          </button>
        </div>
      </div>

      {/* Split Panels */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left: Original Flowchart Viewer */}
        <div className={`${left} transition-all duration-200 flex flex-col`}>
          <OriginalFlowchartViewer
            entry={visioEntry}
            matchedFlow={matchedFlow}
            activeGpsNodeId={activeGpsNodeId}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            className="h-full min-h-[580px]"
          />
        </div>

        {/* Right: GPS Operacional Determinístico */}
        <div className={`${right} transition-all duration-200 flex flex-col`}>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex-1 flex flex-col justify-between">
            {gpsComponent}
          </div>
        </div>
      </div>
    </div>
  );
};
