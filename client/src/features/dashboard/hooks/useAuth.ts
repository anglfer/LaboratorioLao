import { useState, useEffect } from 'react';
import { Usuario } from '@shared/auth-types';

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Primero verificar si hay usuario en localStorage
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            // Verificar con el servidor si la sesión sigue activa
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include', // Importante para enviar cookies de sesión
            });
            
            if (response.ok) {
              const serverUser = await response.json();
              setUsuario(serverUser);
              // Actualizar localStorage con datos del servidor
              localStorage.setItem('usuario', JSON.stringify(serverUser));
            } else {
              // Sesión expirada, limpiar localStorage
              localStorage.removeItem('usuario');
              setUsuario(null);
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('usuario');
            setUsuario(null);
          }
        } else {
          // No hay usuario en localStorage, verificar si hay sesión en servidor
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const serverUser = await response.json();
            setUsuario(serverUser);
            localStorage.setItem('usuario', JSON.stringify(serverUser));
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('usuario');
        setUsuario(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para recibir y enviar cookies de sesión
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
  const { ROLES_PERMISOS } = require('@shared/auth-types');
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
