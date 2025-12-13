// src/services/user.service.ts
import api from '../api/axios.config';

export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  fullName?: string;
  role?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  // Listar todos los usuarios (Solo ADMIN)
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  // Obtener un usuario por ID (Solo ADMIN)
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Crear un nuevo usuario (Solo ADMIN)
  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  // Actualizar un usuario (Solo ADMIN)
  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  }

  // Eliminar un usuario (Solo ADMIN)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Cambiar contraseña del usuario actual
  async changePassword(passwords: ChangePasswordDto): Promise<void> {
    await api.post('/users/change-password', passwords);
  }

  // Obtener perfil del usuario actual
  async getMyProfile(): Promise<User> {
    const response = await api.get('/users/me/profile');
    return response.data;
  }
}

export default new UserService();
