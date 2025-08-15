import { useState, useEffect } from 'react';
import { Usuario } from '@shared/auth-types';

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      console.log('[useAuth] Iniciando verificación de sesión...');
      try {
        // Primero verificar si hay usuario en localStorage
        const storedUser = localStorage.getItem('usuario');
        console.log('[useAuth] Usuario en localStorage:', storedUser);
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('[useAuth] Usuario parseado:', user);
            
            // Verificar con el servidor si la sesión sigue activa
            console.log('[useAuth] Verificando sesión con servidor...');
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include', // Importante para enviar cookies de sesión
            });
            
            console.log('[useAuth] Respuesta del servidor:', response.status, response.ok);
            
            if (response.ok) {
              const serverUser = await response.json();
              console.log('[useAuth] Usuario del servidor:', serverUser);
              setUsuario(serverUser);
              // Actualizar localStorage con datos del servidor
              localStorage.setItem('usuario', JSON.stringify(serverUser));
            } else {
              // Sesión expirada, limpiar localStorage
              console.log('[useAuth] Sesión expirada, limpiando localStorage');
              localStorage.removeItem('usuario');
              setUsuario(null);
            }
          } catch (error) {
            console.error('[useAuth] Error parsing stored user:', error);
            localStorage.removeItem('usuario');
            setUsuario(null);
          }
        } else {
          // No hay usuario en localStorage, verificar si hay sesión en servidor
          console.log('[useAuth] No hay usuario en localStorage, verificando servidor...');
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          
          console.log('[useAuth] Respuesta del servidor (sin localStorage):', response.status);
          
          if (response.ok) {
            const serverUser = await response.json();
            console.log('[useAuth] Usuario encontrado en servidor:', serverUser);
            setUsuario(serverUser);
            localStorage.setItem('usuario', JSON.stringify(serverUser));
          }
        }
      } catch (error) {
        console.error('[useAuth] Error checking session:', error);
        localStorage.removeItem('usuario');
        setUsuario(null);
      } finally {
        console.log('[useAuth] Finalizando verificación, isLoading = false');
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[useAuth] Iniciando login para:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para recibir y enviar cookies de sesión
        body: JSON.stringify({ email, password }),
      });

      console.log('[useAuth] Respuesta de login:', response.status, response.ok);

      if (response.ok) {
        const user = await response.json();
        console.log('[useAuth] Usuario logueado:', user);
        setUsuario(user);
        localStorage.setItem('usuario', JSON.stringify(user));
        return true;
      }
      console.log('[useAuth] Login falló');
      return false;
    } catch (error) {
      console.error('[useAuth] Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('[useAuth] Iniciando logout...');
    try {
      // Llamar al servidor para cerrar la sesión
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Importante para enviar cookies de sesión
      });
      
      console.log('[useAuth] Respuesta de logout del servidor:', response.status);
    } catch (error) {
      console.error('[useAuth] Error en logout del servidor:', error);
    } finally {
      // Siempre limpiar el estado local, incluso si falla el servidor
      console.log('[useAuth] Limpiando estado local...');
      setUsuario(null);
      localStorage.removeItem('usuario');
    }
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
