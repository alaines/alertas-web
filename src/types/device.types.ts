// src/types/device.types.ts

export type DeviceType = 'CAMERA' | 'TRAFFIC_LIGHT' | 'SENSOR' | 'COUNTING_CAMERA';
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Device {
  id: number;
  type: DeviceType;
  brand: string;
  installationYear: number;
  manufacturingYear: number;
  latitude: number;
  longitude: number;
  ipAddress: string;
  username: string;
  password: string;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceDto {
  type: DeviceType;
  brand: string;
  installationYear: number;
  manufacturingYear: number;
  latitude: number;
  longitude: number;
  ipAddress: string;
  username: string;
  password: string;
  status?: DeviceStatus;
}

export interface UpdateDeviceDto {
  type?: DeviceType;
  brand?: string;
  installationYear?: number;
  manufacturingYear?: number;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  username?: string;
  password?: string;
  status?: DeviceStatus;
}
