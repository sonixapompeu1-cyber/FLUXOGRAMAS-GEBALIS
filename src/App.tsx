import React, { useState, useEffect, useCallback } from 'react';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { Home } from './routes/Home';
import { FlowsIndex } from './routes/FlowsIndex';
import { FlowDetail } from './routes/FlowDetail';
import { FlowchartGallery } from './routes/FlowchartGallery';
import { Laboratory } from './routes/Laboratory';
import { Report } from './routes/Report';
import { ReconciliationDashboard } from './routes/ReconciliationDashboard';
import { OperationalValidationPage } from './routes/OperationalValidationPage';
import { RemediationDashboard } from './routes/RemediationDashboard';
import { ReadinessDashboard } from './routes/ReadinessDashboard';
import { OperationalSimulatorPage } from './routes/OperationalSimulatorPage';
import { OperationDashboard } from './routes/OperationDashboard';
import { Why137Page } from './routes/Why137Page';
import { AdminDashboardHub } from './routes/AdminDashboardHub';
import { FlowEditorPage } from './routes/FlowEditorPage';
import { RestrictedAccessView } from './components/RestrictedAccessView';
import { IdentityGateModal } from './components/IdentityGateModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { getAllFlows, getAreas } from './lib/flows';
import { GPSEngine } from './engine/gpsEngine';
import { IdentityGateState } from './types';
import { useAdminAuth } from './auth/useAdminAuth';

export default function App() {
  const [flows, setFlows] = useState(() => getAllFlows());
  const areas = getAreas();
  const { isAuthenticated } = useAdminAuth();

  // Listen to flow updates from the editor
  useEffect(() => {
    const handleFlowUpdate = () => {
      setFlows(getAllFlows());
    };
    window.addEventListener('gebalis-flow-updated', handleFlowUpdate);
    return () => window.removeEventListener('gebalis-flow-updated', handleFlowUpdate);
  }, []);

  // Identity Gate State
  const [gateState, setGateState] = useState<IdentityGateState>(() => {
    return GPSEngine.createDefaultIdentityGate();
  });
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Keyboard shortcut for global search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Route tracking
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search || '/';
    }
    return '/';
  });

  // Listen to browser popstate (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(path);
  }, []);

  // Route parser with Admin Protection (Requisito 2, 9, 10, 34, 35)
  const renderCurrentRoute = () => {
    const [pathname, search] = currentPath.split('?');
    const searchParams = new URLSearchParams(search || '');
    const queryParam = searchParams.get('q') || '';

    // Helper to guard administrative routes (Requisito 9)
    const protectRoute = (component: React.ReactNode) => {
      if (!isAuthenticated) {
        return (
          <RestrictedAccessView
            onNavigateToGallery={() => handleNavigate('/')}
            onAuthenticated={() => handleNavigate(currentPath)}
          />
        );
      }
      return component;
    };

    // 1. PUBLIC ROUTES: Galeria dos 145 Fluxogramas is now the DEFAULT HOME (Requisito 2 & 34)
    if (pathname === '/' || pathname === '' || pathname === '/galeria') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FlowchartGallery flows={flows} onNavigate={handleNavigate} />
        </div>
      );
    }

    // 2. PUBLIC ROUTE: Visualização e navegação de fluxograma individual (Requisito 2)
    if (pathname.startsWith('/fluxos/') || pathname.startsWith('/flows/')) {
      const slug = pathname
        .replace('/fluxos/', '')
        .replace('/flows/', '')
        .replace(/\/$/, '');

      return (
        <FlowDetail
          key={slug}
          slug={slug}
          flows={flows}
          areas={areas}
          onNavigate={handleNavigate}
        />
      );
    }

    // Optional legacy home if navigated directly
    if (pathname === '/home') {
      return (
        <Home 
          flows={flows} 
          areas={areas} 
          onNavigate={handleNavigate}
          gateState={gateState}
          onOpenGateModal={() => setIsGateModalOpen(true)}
        />
      );
    }

    // 3. ADMIN ROUTES: Protected (Requisito 9)

    // Admin Hub
    if (pathname === '/admin' || pathname === '/admin/hub') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboardHub onNavigate={handleNavigate} />
        </div>
      );
    }

    // Admin Flow Editor (Requisito 10)
    if (pathname === '/admin/editor' || pathname === '/editor') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FlowEditorPage flows={flows} onNavigate={handleNavigate} />
        </div>
      );
    }

    // GPS Operacional index
    if (pathname === '/fluxos') {
      return protectRoute(
        <FlowsIndex
          key={queryParam}
          flows={flows}
          areas={areas}
          initialQuery={queryParam}
          onNavigate={handleNavigate}
        />
      );
    }

    // Reconciliação
    if (pathname === '/reconciliacao' || pathname === '/dashboard' || pathname === '/matriz') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReconciliationDashboard onNavigate={handleNavigate} />
        </div>
      );
    }

    // Operação
    if (pathname === '/operacao' || pathname === '/operacional' || pathname === '/operation') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OperationDashboard onNavigate={handleNavigate} />
        </div>
      );
    }

    // Validação
    if (pathname === '/validacao-operacional' || pathname === '/validacao' || pathname === '/conformidade') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OperationalValidationPage onNavigate={handleNavigate} />
        </div>
      );
    }

    // Prontidão Operacional
    if (pathname === '/prontidao-operacional' || pathname === '/prontidao' || pathname === '/readiness') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReadinessDashboard onNavigate={handleNavigate} />
        </div>
      );
    }

    // Simulador
    if (pathname === '/simulador' || pathname === '/simulator' || pathname === '/simulacao') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OperationalSimulatorPage onNavigate={handleNavigate} />
        </div>
      );
    }

    // Governação & Remediação
    if (pathname === '/remediacao' || pathname === '/governacao' || pathname === '/governance' || pathname === '/remediation') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RemediationDashboard onNavigate={handleNavigate} />
        </div>
      );
    }

    // Porquê 137
    if (pathname === '/porque-137' || pathname === '/relatorio-137' || pathname === '/benchmark') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Why137Page onNavigate={handleNavigate} />
        </div>
      );
    }

    // Laboratório
    if (pathname === '/laboratorio') {
      return protectRoute(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Laboratory flows={flows} onNavigate={handleNavigate} />
        </div>
      );
    }

    // Relatório / Auditoria
    if (pathname.startsWith('/relatorio') || pathname.startsWith('/audit')) {
      return protectRoute(
        <Report flows={flows} areas={areas} onNavigate={handleNavigate} />
      );
    }

    // Fallback: Galeria pública
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FlowchartGallery flows={flows} onNavigate={handleNavigate} />
      </div>
    );
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-[#FDFEFE] text-slate-900 font-sans antialiased selection:bg-[#E62382] selection:text-white">
      {/* Institutional Top Header */}
      <SiteHeader 
        currentPath={currentPath} 
        onNavigate={handleNavigate} 
        gateState={gateState}
        onOpenGateModal={() => setIsGateModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      {/* Global Transversal Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Identity Gate Modal */}
      <IdentityGateModal
        isOpen={isGateModalOpen}
        onClose={() => setIsGateModalOpen(false)}
        gateState={gateState}
        onUpdateGateState={setGateState}
      />

      {/* Institutional Footer */}
      <SiteFooter />
    </div>
  );
}
