// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import type { AuthResponse } from '../services/auth.service';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  image?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Verificar si hay una sesión guardada
  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) {
      // Convertir formato de API a formato interno
      setUser({
        id: storedUser.id,
        username: storedUser.username,
        name: storedUser.fullName,
        email: storedUser.email,
        role: storedUser.role.toLowerCase() as 'admin' | 'operator' | 'viewer',
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login({ email, password });
      
      // Convertir formato de API a formato interno
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.fullName,
        email: response.user.email,
        role: response.user.role.toLowerCase() as 'admin' | 'operator' | 'viewer',
      };

      setUser(userData);
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'admin' || user?.role === 'operator',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
