// src/services/device.service.ts
import api from '../api/axios.config';
import type { Device, CreateDeviceDto, UpdateDeviceDto } from '../types/device.types';

class DeviceService {
  async getAllDevices(): Promise<Device[]> {
    const response = await api.get('/devices');
    return response.data;
  }

  async getDevice(id: number): Promise<Device> {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  }

  async createDevice(dto: CreateDeviceDto): Promise<Device> {
    const response = await api.post('/devices', dto);
    return response.data;
  }

  async updateDevice(id: number, dto: UpdateDeviceDto): Promise<Device> {
    const response = await api.patch(`/devices/${id}`, dto);
    return response.data;
  }

  async deleteDevice(id: number): Promise<void> {
    await api.delete(`/devices/${id}`);
  }

  async changeStatus(id: number, status: string): Promise<Device> {
    const response = await api.patch(`/devices/${id}/status`, { status });
    return response.data;
  }
}

export default new DeviceService();
