/**
 * GEBALIS VISION — Gestão de Autenticação do Administrador
 * Palavra-passe estrita: GEBALIS
 * Segregação de Área Pública vs Área de Administrador
 */

const ADMIN_AUTH_KEY = 'gebalis_admin_session_v1';
const ADMIN_PASSWORD = 'GEBALIS';

export interface AdminSession {
  isAuthenticated: boolean;
  loginTime: string | null;
  adminName: string;
}

export function getAdminSession(): AdminSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, loginTime: null, adminName: 'Público' };
  }
  try {
    const raw = sessionStorage.getItem(ADMIN_AUTH_KEY) || localStorage.getItem(ADMIN_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isAuthenticated) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler sessão de administrador:', e);
  }
  return { isAuthenticated: false, loginTime: null, adminName: 'Público' };
}

export function loginAdmin(password: string): { success: boolean; error?: string } {
  if (password === ADMIN_PASSWORD) {
    const session: AdminSession = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      adminName: 'Administrador GEBALIS'
    };
    try {
      sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('gebalis-auth-change', { detail: session }));
    } catch (e) {
      console.warn('Erro ao guardar sessão de administrador:', e);
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Palavra-passe incorreta. O acesso é estritamente reservado ao Administrador GEBALIS.'
  };
}

export function logoutAdmin(): void {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    window.dispatchEvent(new CustomEvent('gebalis-auth-change', { detail: { isAuthenticated: false } }));
  } catch (e) {
    console.warn('Erro ao terminar sessão de administrador:', e);
  }
}
