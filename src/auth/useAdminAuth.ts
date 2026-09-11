import { useState, useEffect } from 'react';
import { getAdminSession, loginAdmin, logoutAdmin, AdminSession } from './adminAuthStore';

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession>(() => getAdminSession());

  useEffect(() => {
    const handleAuthChange = () => {
      setSession(getAdminSession());
    };

    window.addEventListener('gebalis-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('gebalis-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    isAuthenticated: session.isAuthenticated,
    session,
    login: loginAdmin,
    logout: logoutAdmin
  };
}
