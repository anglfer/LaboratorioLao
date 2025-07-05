import { useState, useEffect } from 'react';
import { Usuario } from '../../../../shared/auth-types';

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsuario(user);
      } catch (error) {
        localStorage.removeItem('usuario');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        setUsuario(user);
        localStorage.setItem('usuario', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const hasPermission = (permission: string): boolean => {
    if (!usuario) return false;
    
    // Admin tiene todos los permisos
    if (usuario.rol === 'admin') return true;
    
    // Verificar permisos específicos del rol
    const { ROLES_PERMISOS } = require('../../../../shared/auth-types');
    const rolPermissions = ROLES_PERMISOS.find((r: any) => r.rol === usuario.rol);
    
    if (!rolPermissions) return false;
    
    return rolPermissions.permisos.includes(permission);
  };

  return {
    usuario,
    isLoading,
    login,
    logout,
    hasPermission,
  };
}
