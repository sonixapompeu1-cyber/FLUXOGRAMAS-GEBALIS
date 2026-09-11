import React, { useState } from 'react';
import { InstitutionalStripe } from './InstitutionalStripe';
import { GebalisLogo } from './GebalisLogo';
import {
  Layers,
  Lock,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Search,
  Menu,
  X,
  Compass,
  FileSpreadsheet,
  CheckCircle2,
  Wrench,
  Activity,
  FlaskConical,
  FileText,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { IdentityGateState } from '../types';
import { useAdminAuth } from '../auth/useAdminAuth';
import { AdminLoginModal } from './AdminLoginModal';

interface SiteHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  gateState: IdentityGateState;
  onOpenGateModal: () => void;
  onOpenSearch?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ 
  currentPath, 
  onNavigate, 
  gateState,
  onOpenGateModal,
  onOpenSearch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const { isAuthenticated, logout } = useAdminAuth();

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('/');
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  };

  const isGalleryActive = currentPath === '/' || currentPath === '/galeria';
  const isEditorActive = currentPath.startsWith('/admin/editor');
  const isAdminHubActive = currentPath === '/admin';

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
    >
      {/* Three-segment institutional stripe */}
      <InstitutionalStripe height="h-1.5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-6">
            <button
              id="header-logo-link"
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-[#E62382] rounded-lg p-1 transition-opacity hover:opacity-90"
              aria-label="Gebalis Vision - Galeria dos 145 Fluxogramas"
            >
              <GebalisLogo size="md" />

              <div className="hidden sm:block pl-3 border-l border-slate-200">
                <div className="text-xs font-semibold text-slate-800 tracking-tight leading-none">
                  Gebalis
                </div>
                <div className="text-[13px] font-bold text-[#E62382] tracking-normal leading-tight mt-0.5">
                  Vision · Galeria dos 145 Fluxogramas
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegação Principal">
            {/* PUBLIC NAVIGATION */}
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 relative ${
                isGalleryActive
                  ? 'text-[#E62382] bg-pink-50/90 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Layers className={`w-4 h-4 ${isGalleryActive ? 'text-[#E62382]' : 'text-slate-500'}`} />
              <span>GALERIA DOS 145 FLUXOGRAMAS</span>
              {isGalleryActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E62382] rounded-full" />
              )}
            </button>

            {/* Global Search Button */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors mx-1"
                title="Pesquisar nos 145 fluxogramas (Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">Pesquisar...</span>
              </button>
            )}

            {/* IF NOT AUTHENTICATED: Show only ADMINISTRADOR button (Requisito 3, 4, 5) */}
            {!isAuthenticated ? (
              <div className="ml-4 pl-4 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200/80 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5 text-[#E62382]" />
                  <span>ADMINISTRADOR</span>
                </button>
              </div>
            ) : (
              /* IF AUTHENTICATED: Show ADMIN Area Navigation (Requisito 7, 8, 35) */
              <div className="flex items-center space-x-1 ml-3 pl-3 border-l border-slate-200">
                {/* Editor Shortcut */}
                <button
                  type="button"
                  onClick={() => handleNavClick('/admin/editor')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isEditorActive
                      ? 'text-[#E62382] bg-pink-50 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Editor de Fluxogramas</span>
                </button>

                {/* Admin Hub Navigation */}
                <button
                  type="button"
                  onClick={() => handleNavClick('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isAdminHubActive
                      ? 'text-[#E62382] bg-pink-50 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Painel Admin</span>
                </button>

                {/* Modules Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>Módulos Técnicos</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {adminDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onMouseLeave={() => setAdminDropdownOpen(false)}
                    >
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Navegação Técnica
                      </div>
                      <button
                        onClick={() => handleNavClick('/fluxos')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#8CBD45]" /> GPS Operacional
                      </button>
                      <button
                        onClick={() => handleNavClick('/reconciliacao')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" /> Reconciliação
                      </button>
                      <button
                        onClick={() => handleNavClick('/validacao-operacional')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validação
                      </button>
                      <button
                        onClick={() => handleNavClick('/remediacao')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" /> Remediação
                      </button>
                      <button
                        onClick={() => handleNavClick('/operacao')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600" /> Operação & Cockpit
                      </button>
                      <button
                        onClick={() => handleNavClick('/simulador')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> Simulador
                      </button>
                      <button
                        onClick={() => handleNavClick('/relatorio')}
                        className="w-full px-3 py-2 text-xs font-semibold text-left text-slate-700 hover:bg-pink-50 hover:text-[#E62382] flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" /> Auditoria V7
                      </button>
                    </div>
                  )}
                </div>

                {/* Identity Gate Modal Button (Admin only) */}
                <button
                  type="button"
                  onClick={onOpenGateModal}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    gateState.status === 'AUTORIZADO'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Gate de Identidade"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gate</span>
                </button>

                {/* Logout Button (Requisito 8) */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors ml-2"
                  title="Terminar Sessão de Administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>SAIR</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-[#E62382]" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sair</span>
              </button>
            )}

            <button
              id="mobile-menu-toggle-button"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navegação Principal
          </div>
          
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${
              isGalleryActive ? 'text-[#E62382] bg-pink-50' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-[#E62382]" />
            <span>Galeria dos 145 Fluxogramas</span>
          </button>

          {/* Admin Section in Mobile Drawer */}
          {isAuthenticated ? (
            <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-xs font-bold text-[#E62382] uppercase tracking-wider">
                Área de Administrador
              </div>
              <button
                type="button"
                onClick={() => handleNavClick('/admin/editor')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-left text-slate-700 hover:bg-slate-50"
              >
                <span>Editor de Fluxogramas</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/admin')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-left text-slate-700 hover:bg-slate-50"
              >
                <span>Painel de Controlo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/fluxos')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-left text-slate-700 hover:bg-slate-50"
              >
                <span>GPS Operacional</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/reconciliacao')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-left text-slate-700 hover:bg-slate-50"
              >
                <span>Reconciliação</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/operacao')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-semibold text-left text-slate-700 hover:bg-slate-50"
              >
                <span>Operação & Cockpit</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold text-left text-rose-700 bg-rose-50 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão (SAIR)</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAdminLoginOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200"
              >
                <Lock className="w-4 h-4 text-[#E62382]" />
                <span>Acesso de Administrador</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin Login Modal (Requisito 5) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          onNavigate('/admin');
        }}
      />
    </header>
  );
};
