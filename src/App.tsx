// src/App.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchIncidents } from './api/incidents';
import type { Incident } from './api/incidents';

// Centro de Lima aproximado
const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

// Colores y emojis para cada tipo de incidente
const incidentConfig: Record<string, { color: string; emoji: string }> = {
  'ACCIDENT': { color: '#dc3545', emoji: '🚗' },
  'CONGESTION': { color: '#ff9800', emoji: '🚦' },
  'HAZARD': { color: '#e91e63', emoji: '⚠️' },
  'POLICE': { color: '#0056b3', emoji: '🚓' },
  'ROAD_CLOSED': { color: '#6f42c1', emoji: '🚧' },
  'ROAD_HAZARD': { color: '#fd7e14', emoji: '⛔' },
  'DISABLED_VEHICLE': { color: '#17a2b8', emoji: '🚙' },
  'JAM': { color: '#ffc107', emoji: '🚥' },
  'WEATHERHAZARD': { color: '#6c757d', emoji: '🌧️' },
  'CONSTRUCTION': { color: '#795548', emoji: '🏗️' },
  'OBJECT_IN_ROADWAY': { color: '#b71c1c', emoji: '📦' },
};

function getIncidentConfig(type: string) {
  return incidentConfig[type] || { color: '#999999', emoji: '📍' };
}

// Función para crear iconos personalizados
function createCustomIcon(type: string) {
  const config = getIncidentConfig(type);
  
  const html = `
    <div style="
      background-color: ${config.color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 20px;
    ">
      ${config.emoji}
    </div>
  `;

  return L.divIcon({
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'custom-icon'
  });
}

function formatCategory(cat: string | null): string {
  if (!cat) return 'sin categoría';
  return cat;
}

// Mapeo de tipos a español
const typeTranslations: Record<string, string> = {
  'ACCIDENT': 'Accidente',
  'CONGESTION': 'Congestión',
  'HAZARD': 'Peligro',
  'POLICE': 'Policía',
  'ROAD_CLOSED': 'Vía Cerrada',
  'ROAD_HAZARD': 'Peligro en la Vía',
  'DISABLED_VEHICLE': 'Vehículo Descompuesto',
  'JAM': 'Embotellamiento',
  'WEATHERHAZARD': 'Peligro Climático',
  'CONSTRUCTION': 'Construcción',
  'OBJECT_IN_ROADWAY': 'Objeto en la Vía',
};

function getTypeInSpanish(type: string): string {
  return typeTranslations[type] || type;
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Obtener tipos únicos de incidentes
  const incidentTypes = Array.from(new Set(incidents.map(i => i.type))).sort();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents({ status: 'active', limit: 200 });
      setIncidents(data);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(`Error al cargar incidentes: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filtrar incidentes por tipo seleccionado
  const filteredIncidents = selectedType 
    ? incidents.filter(i => i.type === selectedType)
    : incidents;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Panel lateral */}
      <aside style={{ width: '340px', borderRight: '1px solid #ddd', padding: '12px', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }} className="bg-light">
        <h2 className="mb-3 h4">🚨 Alertas viales</h2>
        <small className="text-muted mb-3 d-block">Fuente: Waze (vía alertas-api)</small>

        <div className="d-flex gap-2 mb-3">
          <button onClick={load} disabled={loading} className="btn btn-primary btn-sm">
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
          <span className="small align-self-center badge bg-info">
            {filteredIncidents.length}
          </span>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
            {error}
          </div>
        )}

        {/* Filtro por tipo */}
        <div className="mb-3">
          <label className="form-label small fw-bold">
            Filtrar por tipo:
          </label>
          <select 
            value={selectedType ?? ''} 
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="form-select form-select-sm"
          >
            <option value="">Todos ({incidents.length})</option>
            {incidentTypes.map((type) => {
              const count = incidents.filter(i => i.type === type).length;
              return (
                <option key={type} value={type}>
                  {getTypeInSpanish(type)} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: '8px' }}>
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((i) => (
              <div key={i.id} className="border-bottom pb-2 mb-2 small">
                <div className="fw-bold text-primary">{getTypeInSpanish(i.type)}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  ({formatCategory(i.category)})
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                </div>
                <div className="text-secondary" style={{ fontSize: '11px', marginTop: '2px' }}>
                  ⭐ {i.reliability ?? '-'} | 🎯 {i.priority ?? '-'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted text-center small" style={{ paddingTop: '20px' }}>
              No hay incidentes de este tipo
            </div>
          )}
        </div>
      </aside>

      {/* Mapa */}
      <div style={{ flex: 1, height: '100%', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
        <MapContainer
          center={LIMA_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredIncidents.map((i) => (
            <Marker key={i.id} position={[i.lat, i.lon]} icon={createCustomIcon(i.type)}>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong>{getTypeInSpanish(i.type)}</strong> ({formatCategory(i.category)})
                  <br />
                  {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                  <br />
                  Prioridad: {i.priority ?? '-'}
                  <br />
                  Confiabilidad: {i.reliability ?? '-'}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
