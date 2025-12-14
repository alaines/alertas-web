// src/services/auth.service.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.18.230/api/v1';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  };
}

// Crear instancia dedicada para auth (sin interceptores)
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
      console.log('With credentials:', { ...credentials, password: '***' });
      
      const response = await authAxios.post('/auth/login', credentials);
      
      console.log('Login successful:', response.data);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isOperator(): boolean {
    return this.hasRole('OPERATOR');
  }
}

export default new AuthService();
