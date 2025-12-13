// src/App.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchIncidents } from './api/incidents';
import type { Incident } from './api/incidents';

// Centro de Lima aproximado
const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

// Configuración de actualización automática (en milisegundos)
const AUTO_REFRESH_INTERVAL = 60000; // 60 segundos - personalizable

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
  return incidentConfig[type] || { color: '#999999', icon: 'fas fa-map-marker-alt' };
}

// Función para crear iconos personalizados
function createCustomIcon(type: string, isClosed = false) {
  const config = getIncidentConfig(type);
  const backgroundColor = isClosed ? '#6c757d' : config.color; // Gris para cerrados
  const opacity = isClosed ? '0.7' : '1';
  
  const html = `
    <div style="
      background-color: ${backgroundColor};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      opacity: ${opacity};
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

// Función para formatear la hora del incidente
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// Función para calcular minutos transcurridos
function getMinutesAgo(isoString: string): number {
  const pubTime = new Date(isoString).getTime();
  const now = new Date().getTime();
  return Math.floor((now - pubTime) / (1000 * 60));
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [, setCurrentTime] = useState(Date.now()); // Para forzar re-render de tiempos

  // Obtener tipos únicos de incidentes
  const incidentTypes = Array.from(new Set(incidents.map(i => i.type))).sort();
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(incidentTypes));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents({ status: 'active', limit: 200 });
      // Guardar los incidentes que desaparecieron con timestamp
      const newClosed = incidents.filter(old => !data.some(n => n.id === old.id)).map(inc => ({
        ...inc,
        closedAt: new Date().toISOString(),
        closedBy: 'Waze'
      }));
      if (newClosed.length > 0) {
        setClosedIncidents(prev => [...newClosed, ...prev].slice(0, 100));
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

  // Cargar incidentes al inicio
  useEffect(() => {
    load();
  }, []);

  // Auto-refresh periódico
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, AUTO_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [incidents]);

  // Actualizar tiempo cada minuto para refrescar "hace X minutos"
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // cada 60 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Inicializar capas visibles cuando se cargan los incidentes
  useEffect(() => {
    if (incidentTypes.length > 0 && visibleLayers.size === 0) {
      setVisibleLayers(new Set(incidentTypes));
    }
  }, [incidentTypes]);

  const toggleLayer = (type: string) => {
    const newLayers = new Set(visibleLayers);
    if (newLayers.has(type)) {
      newLayers.delete(type);
    } else {
      newLayers.add(type);
    }
    setVisibleLayers(newLayers);
    
    // Sincronizar filtro dropdown: si solo hay una capa visible, seleccionarla; si hay varias o ninguna, "Todos"
    if (newLayers.size === 1) {
      setSelectedType(Array.from(newLayers)[0]);
    } else {
      setSelectedType(null);
    }
  };

  // Obtener incidentes cerrados en últimos 5 minutos
  const recentlyClosedIncidents = closedIncidents.filter(inc => {
    if (!inc.closedAt) return false;
    const closedTime = new Date(inc.closedAt).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - closedTime) < fiveMinutes;
  });

  // Combinar incidentes activos con recientemente cerrados
  const allIncidents = [...incidents, ...recentlyClosedIncidents];

  // Filtrar incidentes por tipo seleccionado y por capas visibles
  const filteredIncidents = selectedType 
    ? allIncidents.filter(i => i.type === selectedType && visibleLayers.has(i.type))
    : allIncidents.filter(i => visibleLayers.has(i.type));

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
                        <div className="fw-bold text-danger">
                          <i className="fas fa-check-circle me-1"></i>
                          {getTypeInSpanish(i.type)}
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                        </div>
                        {i.closedAt && (
                          <div className="text-secondary" style={{ fontSize: '10px', marginTop: '4px' }}>
                            <i className="fas fa-clock me-1"></i>
                            Cerrado hace {getMinutesAgo(i.closedAt)} min
                            <br />
                            <i className="fas fa-user me-1"></i>
                            Por: {i.closedBy ?? 'Waze'}
                          </div>
                        )}
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

      {/* Botón fijo para mostrar/ocultar panel lateral */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="btn btn-light p-2"
        style={{
          position: 'fixed',
          top: '76px',
          left: showSidebar ? '356px' : '12px',
          zIndex: 3000,
          border: '1px solid #ddd',
          borderRadius: '8px',
          minWidth: '40px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          backgroundColor: 'white'
        }}
        title={showSidebar ? 'Ocultar panel' : 'Mostrar panel'}
      >
        <i className="fas fa-bars" style={{ fontSize: '16px' }}></i>
      </button>

      {/* Contenedor principal con panel y mapa */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel lateral */}
        {showSidebar && (
        <aside style={{ width: '340px', borderRight: '1px solid #ddd', padding: '12px', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box', position: 'relative' }} className="bg-light">
          <h2 className="mb-3 h5">Incidentes Activos</h2>

          <div className="d-flex gap-2 mb-3">
            <span className="small align-self-center badge bg-info">
              {filteredIncidents.length} incidentes
            </span>
            {loading && <span className="small text-muted">Actualizando...</span>}
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
              onChange={(e) => {
                const newType = e.target.value || null;
                setSelectedType(newType);
                // Sincronizar capas: si selecciona un tipo, mostrar solo ese; si "Todos", mostrar todas
                if (newType) {
                  setVisibleLayers(new Set([newType]));
                } else {
                  setVisibleLayers(new Set(incidentTypes));
                }
              }}
              className="form-select form-select-sm"
            >
              <option value="">Todos ({allIncidents.length})</option>
              {incidentTypes.map((type) => {
                const count = allIncidents.filter(i => i.type === type).length;
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
              filteredIncidents.map((i) => {
                const isClosed = !!i.closedAt;
                return (
                  <div key={i.id} className="border-bottom pb-2 mb-2 small" style={{ opacity: isClosed ? 0.7 : 1 }}>
                    <div className="fw-bold text-primary">
                      {getTypeInSpanish(i.type)}
                      {isClosed && <span className="badge bg-secondary ms-2" style={{ fontSize: '9px' }}>CERRADO</span>}
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      ({formatCategory(i.category)})
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px', color: '#0056b3', fontWeight: '600' }}>
                      <i className="fas fa-clock me-1"></i>
                      {formatTime(i.pub_time)} · Hace {getMinutesAgo(i.pub_time)} min
                    </div>
                    <div className="text-secondary" style={{ fontSize: '11px', marginTop: '2px' }}>
                      <i className="fas fa-star me-1"></i>
                      {i.reliability ?? '-'}
                      <span className="mx-2">|</span>
                      <i className="fas fa-bullseye me-1"></i>
                      {i.priority ?? '-'}
                    </div>
                    {isClosed && (
                      <div className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>
                        Cerrado por {i.closedBy ?? 'Waze'}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-muted text-center small" style={{ paddingTop: '20px' }}>
                No hay incidentes de este tipo
              </div>
            )}
          </div>
        </aside>
        )}

        {/* Mapa */}
        <div style={{ flex: 1, height: '100%', width: '100%', boxSizing: 'border-box', position: 'relative' }}>

          {/* Panel de Filtros de Capas */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000, backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-layer-group"></i>
              Capas
            </div>
            {incidentTypes.map((type) => {
              const count = allIncidents.filter(i => i.type === type).length;
              const isVisible = visibleLayers.has(type);
              const config = getIncidentConfig(type);
              return (
                <div key={type} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isVisible}
                    onChange={() => toggleLayer(type)}
                    style={{ cursor: 'pointer' }}
                  />
                  <i className={config.icon} style={{ color: config.color, fontSize: '14px' }}></i>
                  <span style={{ fontSize: '12px', flex: 1 }}>
                    {getTypeInSpanish(type)} ({count})
                  </span>
                </div>
              );
            })}
          </div>

          <MapContainer
            center={LIMA_CENTER}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredIncidents.map((i) => {
              const isClosed = !!i.closedAt;
              return (
                <Marker key={i.id} position={[i.lat, i.lon]} icon={createCustomIcon(i.type, isClosed)}>
                  <Popup>
                    <div style={{ fontSize: '12px' }}>
                      <strong>{getTypeInSpanish(i.type)}</strong> ({formatCategory(i.category)})
                      <br />
                      {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                      <br />
                      <span style={{ color: '#0056b3', fontWeight: 'bold' }}>
                        <i className="fas fa-clock me-1"></i>
                        {formatTime(i.pub_time)} ({getMinutesAgo(i.pub_time)} min)
                      </span>
                      <br />
                      Prioridad: {i.priority ?? '-'}
                      <br />
                      Confiabilidad: {i.reliability ?? '-'}
                      {isClosed && (
                        <>
                          <br />
                          <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                            <i className="fas fa-circle-xmark me-1"></i>
                            CERRADO
                          </span>
                          <br />
                          <span style={{ fontSize: '11px', color: '#6c757d' }}>
                            Cerrado por: {i.closedBy ?? 'Waze'}
                          </span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
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
