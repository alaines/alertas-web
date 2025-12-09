// src/api/incidents.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Incident {
  id: number;
  uuid: string;
  type: string;
  subtype: string | null;
  city: string | null;
  street: string | null;
  category: string | null;
  priority: number | null;
  status: string;
  pub_time: string;      // viene como ISO string
  reliability: number | null;
  confidence: number | null;
  lat: number;
  lon: number;
  distance?: number;
}

// Datos de prueba para desarrollo
const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    uuid: 'test-1',
    type: 'ACCIDENT',
    subtype: null,
    city: 'Lima',
    street: 'Av. Javier Prado',
    category: 'accident',
    priority: 3,
    status: 'active',
    pub_time: new Date().toISOString(),
    reliability: 8,
    confidence: 9,
    lat: -12.0970,
    lon: -77.0340,
  },
  {
    id: 2,
    uuid: 'test-2',
    type: 'CONGESTION',
    subtype: null,
    city: 'Lima',
    street: 'Av. Paseo de la República',
    category: 'congestion',
    priority: 2,
    status: 'active',
    pub_time: new Date().toISOString(),
    reliability: 7,
    confidence: 8,
    lat: -12.0464,
    lon: -77.0428,
  },
  {
    id: 3,
    uuid: 'test-3',
    type: 'HAZARD',
    subtype: null,
    city: 'Lima',
    street: 'Av. Sáenz Peña',
    category: 'hazard',
    priority: 4,
    status: 'active',
    pub_time: new Date().toISOString(),
    reliability: 6,
    confidence: 7,
    lat: -12.0500,
    lon: -77.0500,
  },
];

export async function fetchIncidents(params: {
  status?: string;
  type?: string;
  category?: string;
  limit?: number;
} = {}): Promise<Incident[]> {
  // En desarrollo, usar datos de prueba si falla la API
  try {
    const res = await api.get<Incident[]>('/incidents', {
      params: {
        status: params.status ?? 'active',
        type: params.type,
        category: params.category,
        limit: params.limit ?? 200,
      },
    });
    return res.data;
  } catch (error) {
    console.warn('No se pudo conectar a la API, usando datos de prueba');
    return MOCK_INCIDENTS;
  }
}
