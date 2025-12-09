// src/App.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchIncidents } from './api/incidents';
import type { Incident } from './api/incidents';

// Centro de Lima aproximado
const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

// Colores y iconos para cada tipo de incidente
const incidentConfig: Record<string, { color: string; icon: string }> = {
  'ACCIDENT': { color: '#dc3545', icon: 'fas fa-car-crash' },
  'CONGESTION': { color: '#ff9800', icon: 'fas fa-traffic-light' },
  'HAZARD': { color: '#e91e63', icon: 'fas fa-exclamation-triangle' },
  'POLICE': { color: '#0056b3', icon: 'fas fa-police' },
  'ROAD_CLOSED': { color: '#6f42c1', icon: 'fas fa-road' },
  'ROAD_HAZARD': { color: '#fd7e14', icon: 'fas fa-ban' },
  'DISABLED_VEHICLE': { color: '#17a2b8', icon: 'fas fa-car' },
  'JAM': { color: '#ffc107', icon: 'fas fa-traffic-light' },
  'WEATHERHAZARD': { color: '#6c757d', icon: 'fas fa-cloud-rain' },
  'CONSTRUCTION': { color: '#795548', icon: 'fas fa-hard-hat' },
  'OBJECT_IN_ROADWAY': { color: '#b71c1c', icon: 'fas fa-box' },
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
    ">
      <i class="${config.icon}" style="color: white; font-size: 20px;"></i>
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
  const [closedIncidents, setClosedIncidents] = useState<Incident[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName] = useState('Aland Laines');
  const [userImage] = useState<string | null>(null);

  // Obtener tipos únicos de incidentes
  const incidentTypes = Array.from(new Set(incidents.map(i => i.type))).sort();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents({ status: 'active', limit: 200 });
      // Guardar los incidentes que desaparecieron
      const newClosed = incidents.filter(old => !data.some(n => n.id === old.id));
      if (newClosed.length > 0) {
        setClosedIncidents(prev => [...newClosed, ...prev].slice(0, 50)); // Guardar últimos 50
      }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Barra Superior */}
      <header className="bg-white border-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', boxSizing: 'border-box', height: '60px' }}>
        {/* Logo a la izquierda */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-map-marker-alt" style={{ fontSize: '24px' }}></i>
          ALERTAS VIALES
        </div>

        {/* Notificaciones y Usuario a la derecha */}
        <div className="d-flex gap-3 align-items-center" style={{ position: 'relative' }}>
          {/* Campana de Notificaciones */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-light p-2"
              style={{ position: 'relative' }}
            >
              <i className="fas fa-bell" style={{ fontSize: '18px' }}></i>
              {closedIncidents.length > 0 && (
                <span className="badge bg-danger" style={{ position: 'absolute', top: '0', right: '0', fontSize: '10px' }}>
                  {closedIncidents.length}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showNotifications && (
              <div className="bg-white border rounded" style={{ position: 'absolute', top: '100%', right: '0', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, marginTop: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div className="p-3 border-bottom">
                  <strong style={{ fontSize: '14px' }}>Alertas Cerradas</strong>
                </div>
                {closedIncidents.length > 0 ? (
                  <div>
                    {closedIncidents.map((i) => (
                      <div key={i.id} className="p-2 border-bottom small" style={{ fontSize: '12px' }}>
                        <div className="fw-bold text-danger">✓ {getTypeInSpanish(i.type)}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-muted text-center" style={{ fontSize: '12px' }}>
                    No hay alertas cerradas
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usuario */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-light p-2 d-flex align-items-center gap-2"
              style={{ fontSize: '14px' }}
            >
              {userImage ? (
                <img 
                  src={userImage} 
                  alt="User" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0056b3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-user" style={{ color: 'white', fontSize: '16px' }}></i>
                </div>
              )}
              <span>{userName}</span>
            </button>

            {/* Dropdown de Usuario */}
            {showUserMenu && (
              <div className="bg-white border rounded" style={{ position: 'absolute', top: '100%', right: '0', width: '200px', zIndex: 1000, marginTop: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-user me-2"></i>Mi Perfil
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-cog me-2"></i>Configuración
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-lock me-2"></i>Cambiar Contraseña
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark hover-light" style={{ fontSize: '14px', color: '#dc3545' }}>
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenedor principal con panel y mapa */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel lateral */}
        <aside style={{ width: '340px', borderRight: '1px solid #ddd', padding: '12px', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }} className="bg-light">
          <h2 className="mb-3 h5">Incidentes Activos</h2>

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

      {/* Footer */}
      <footer className="bg-light border-top" style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#666' }}>
        Alertas Viales - Derechos Reservados - 2025
      </footer>
    </div>
  );
}
