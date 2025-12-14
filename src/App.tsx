// src/App.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchIncidents, getIncidentByUuid } from './api/incidents';
import type { Incident } from './api/incidents';
import ticketService from './services/ticket.service';
import deviceService from './services/device.service';
import type { Device } from './types/device.types';
import { useAuth } from './context/AuthContext';

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

// Configuración de dispositivos
const deviceConfig: Record<string, { color: string; icon: string; label: string }> = {
  'CAMERA': { color: '#3498db', icon: 'fas fa-video', label: 'Cámara' },
  'TRAFFIC_LIGHT': { color: '#e67e22', icon: 'fas fa-traffic-light', label: 'Semáforo' },
  'SENSOR': { color: '#9b59b6', icon: 'fas fa-microchip', label: 'Sensor' },
  'COUNTING_CAMERA': { color: '#16a085', icon: 'fas fa-camera', label: 'Cámara de Conteo' },
};

function getDeviceConfig(type: string) {
  return deviceConfig[type] || { color: '#95a5a6', icon: 'fas fa-hdd', label: 'Dispositivo' };
}

// Colores por estado del dispositivo
const deviceStatusColors: Record<string, string> = {
  'ACTIVE': '#28a745',
  'INACTIVE': '#dc3545',
  'MAINTENANCE': '#ffc107',
};

function getDeviceStatusColor(status: string) {
  return deviceStatusColors[status] || '#6c757d';
}

// Función para crear iconos personalizados
function createCustomIcon(type: string, isClosed = false, hasOpenTicket = false) {
  const config = getIncidentConfig(type);
  const backgroundColor = isClosed ? '#6c757d' : config.color; // Gris para cerrados
  const opacity = isClosed ? '0.7' : '1';
  
  // Agregar badge si tiene ticket abierto
  const ticketBadge = hasOpenTicket ? `
    <div style="
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #0056b3;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <i class="fas fa-ticket-alt" style="color: white; font-size: 9px;"></i>
    </div>
  ` : '';
  
  const html = `
    <div style="position: relative;">
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
      ${ticketBadge}
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

// Función para crear iconos de dispositivos
function createDeviceIcon(type: string, status: string) {
  const config = getDeviceConfig(type);
  const statusColor = getDeviceStatusColor(status);
  
  const html = `
    <div style="position: relative;">
      <div style="
        background-color: ${config.color};
        width: 35px;
        height: 35px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <i class="${config.icon}" style="color: white; font-size: 16px;"></i>
      </div>
      <div style="
        position: absolute;
        bottom: -3px;
        right: -3px;
        background-color: ${statusColor};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'custom-device-icon'
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
  const navigate = useNavigate();
  const { user, logout, isAdmin, isOperator } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [closedIncidents, setClosedIncidents] = useState<Incident[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [, setCurrentTime] = useState(Date.now()); // Para forzar re-render de tiempos
  const [devices, setDevices] = useState<Device[]>([]);

  // Obtener tipos únicos de incidentes
  const incidentTypes = Array.from(new Set(incidents.map(i => i.type))).sort();
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(incidentTypes));
  
  // Device layer visibility
  const [visibleDeviceTypes, setVisibleDeviceTypes] = useState<Set<string>>(new Set(['CAMERA']));

  const loadDevices = async () => {
    try {
      const data = await deviceService.getAllDevices();
      setDevices(data);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents({ status: 'active', limit: 200 });
      
      // Obtener todos los tickets para verificar cuáles están abiertos
      let allTickets: any[] = [];
      try {
        allTickets = await ticketService.getAllTickets();
        console.log('=== DEBUG TICKETS ===');
        console.log('Total tickets cargados:', allTickets.length);
        console.log('Tickets:', allTickets);
        
        // Mostrar tickets con incidentId
        const ticketsWithIncident = allTickets.filter(t => t.incidentId);
        console.log('Tickets con incidentId:', ticketsWithIncident.length);
        ticketsWithIncident.forEach(t => {
          console.log(`  Ticket ${t.id}: incidentId=${t.incidentId}, status=${t.status}`);
        });
      } catch (error) {
        console.error('ERROR cargando tickets:', error);
      }
      
      console.log('=== DEBUG INCIDENTES ===');
      console.log('Total incidentes activos:', data.length);
      console.log('IDs de incidentes:', data.map(i => i.id));
      
      // Marcar incidentes que tienen tickets abiertos o en progreso
      const incidentsWithTicketInfo = data.map(incident => {
        const relatedTickets = allTickets.filter(t => t.incidentUuid === incident.uuid);
        const openTickets = relatedTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
        const hasOpen = openTickets.length > 0;
        
        if (relatedTickets.length > 0) {
          console.log(`Incidente ${incident.id}:`, {
            totalTickets: relatedTickets.length,
            openTickets: openTickets.length,
            hasOpenTicket: hasOpen,
            tickets: relatedTickets.map(t => ({ id: t.id, status: t.status }))
          });
        }
        
        return {
          ...incident,
          hasOpenTicket: hasOpen,
          ticketCount: relatedTickets.length
        };
      });
      
      console.log('Incidentes con info de tickets:', incidentsWithTicketInfo.filter(i => i.hasOpenTicket).length);
      
      // Buscar tickets con incidentUuid que no estén en los incidentes activos
      const orphanTicketUuids = allTickets
        .filter(t => t.incidentUuid && (t.status === 'OPEN' || t.status === 'IN_PROGRESS'))
        .map(t => t.incidentUuid)
        .filter(uuid => !data.some(inc => inc.uuid === uuid));
      
      console.log('UUIDs de incidentes con tickets pero no activos en Waze:', orphanTicketUuids);
      
      // Cargar incidentes huérfanos (con tickets pero no activos en Waze)
      const orphanIncidents: Incident[] = [];
      for (const uuid of orphanTicketUuids) {
        try {
          // Buscar en incidentes previos primero
          const prevIncident = incidents.find(i => i.uuid === uuid);
          const incident = prevIncident || await getIncidentByUuid(uuid);
          if (incident) {
            const relatedTickets = allTickets.filter(t => t.incidentUuid === uuid);
            const openTickets = relatedTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
            orphanIncidents.push({
              ...incident,
              status: 'inactive',
              hasOpenTicket: openTickets.length > 0,
              ticketCount: relatedTickets.length
            });
            console.log(`Incidente huérfano recuperado: ${uuid}`);
          }
        } catch (error) {
          console.warn(`No se pudo cargar incidente huérfano ${uuid}`, error);
        }
      }
      
      // Mantener incidentes previos con tickets abiertos aunque hayan desaparecido de Waze
      const incidentsWithOpenTickets = incidents.filter(old => {
        const stillActive = data.some(n => n.uuid === old.uuid);
        const hasOpenTicket = orphanTicketUuids.includes(old.uuid) || old.hasOpenTicket;
        return !stillActive && hasOpenTicket;
      }).map(inc => {
        const relatedTickets = allTickets.filter(t => t.incidentUuid === inc.uuid);
        const openTickets = relatedTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
        return {
          ...inc,
          status: 'inactive',
          hasOpenTicket: openTickets.length > 0,
          ticketCount: relatedTickets.length
        };
      });
      
      console.log('Incidentes inactivos pero con tickets abiertos a mantener:', incidentsWithOpenTickets.length);
      
      // Combinar incidentes activos + huérfanos recuperados + previos con tickets
      const allIncidents = [...incidentsWithTicketInfo, ...orphanIncidents, ...incidentsWithOpenTickets];
      
      // Guardar los incidentes que desaparecieron SIN tickets abiertos
      const newClosed = incidents.filter(old => {
        const stillActive = data.some(n => n.id === old.id);
        return !stillActive && !old.hasOpenTicket;
      }).map(inc => ({
        ...inc,
        closedAt: new Date().toISOString(),
        closedBy: 'Waze'
      }));
      
      if (newClosed.length > 0) {
        setClosedIncidents(prev => [...newClosed, ...prev].slice(0, 100));
      }
      
      setIncidents(allIncidents);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(`Error al cargar incidentes: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar incidentes y dispositivos al inicio
  useEffect(() => {
    load();
    loadDevices();
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
      // Por defecto solo mostrar ACCIDENT
      setVisibleLayers(new Set(['ACCIDENT']));
    }
  }, [incidentTypes]);

  const toggleDeviceLayer = (type: string) => {
    const newLayers = new Set(visibleDeviceTypes);
    if (newLayers.has(type)) {
      newLayers.delete(type);
    } else {
      newLayers.add(type);
    }
    setVisibleDeviceTypes(newLayers);
  };

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
        {/* Logo y Menú de Sistema a la izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-map-marker-alt" style={{ fontSize: '24px' }}></i>
            ALERTAS VIALES
          </div>

          {/* Menú de Sistema */}
          <nav className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-primary"
              style={{ fontSize: '14px' }}
            >
              <i className="fas fa-map me-2"></i>
              Mapa
            </button>
            <button 
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '14px' }}
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-chart-line me-2"></i>
              Dashboard
            </button>
            {isOperator && (
              <>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '14px' }}
                  onClick={() => navigate('/tickets')}
                >
                  <i className="fas fa-ticket-alt me-2"></i>
                  Tickets
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '14px' }}
                  onClick={() => navigate('/reports')}
                >
                  <i className="fas fa-file-alt me-2"></i>
                  Reportes
                </button>
              </>
            )}
            {isAdmin && (
              <button 
                className="btn btn-sm btn-outline-primary"
                style={{ fontSize: '14px' }}
                onClick={() => navigate('/admin')}
              >
                <i className="fas fa-cog me-2"></i>
                Administración
              </button>
            )}
          </nav>
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
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0056b3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-user" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              <span>{user?.name || 'Usuario'}</span>
            </button>

            {/* Dropdown de Usuario */}
            {showUserMenu && (
              <div className="bg-white border rounded" style={{ position: 'absolute', top: '100%', right: '0', width: '200px', zIndex: 3001, marginTop: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-user me-2"></i>Mi Perfil
                </a>
                {isAdmin && (
                  <a 
                    href="#" 
                    className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" 
                    style={{ fontSize: '14px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/admin');
                    }}
                  >
                    <i className="fas fa-cog me-2"></i>Panel Admin
                  </a>
                )}
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-cog me-2"></i>Configuración
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-lock me-2"></i>Cambiar Contraseña
                </a>
                <a 
                  href="#" 
                  className="d-block p-3 text-decoration-none text-dark hover-light" 
                  style={{ fontSize: '14px', color: '#dc3545' }}
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
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
            
            {/* Incidentes */}
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', color: '#495057' }}>
              Incidentes
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
            
            {/* Periféricos */}
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', color: '#495057' }}>
              Periféricos
            </div>
            {Object.keys(deviceConfig).map((type) => {
              const count = devices.filter(d => d.type === type).length;
              const isVisible = visibleDeviceTypes.has(type);
              const config = getDeviceConfig(type);
              return (
                <div key={type} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isVisible}
                    onChange={() => toggleDeviceLayer(type)}
                    style={{ cursor: 'pointer' }}
                  />
                  <i className={config.icon} style={{ color: config.color, fontSize: '14px' }}></i>
                  <span style={{ fontSize: '12px', flex: 1 }}>
                    {config.label} ({count})
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Datos de incidentes: <a href="https://www.waze.com">Waze</a>&reg;'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredIncidents.map((i) => {
              const isClosed = !!i.closedAt;
              const hasOpenTicket = i.hasOpenTicket || false;
              return (
                <Marker key={i.id} position={[i.lat, i.lon]} icon={createCustomIcon(i.type, isClosed, hasOpenTicket)}>
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
                      {hasOpenTicket && (
                        <>
                          <br />
                          <span style={{ color: '#0056b3', fontWeight: 'bold' }}>
                            <i className="fas fa-ticket-alt me-1"></i>
                            CON TICKET ABIERTO
                          </span>
                        </>
                      )}
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
                      {isOperator && !isClosed && (
                        <>
                          <br />
                          {hasOpenTicket || (i.ticketCount && i.ticketCount > 0) ? (
                            <button
                              className="btn btn-sm btn-success mt-2 w-100"
                              onClick={() => {
                                // Navegar a la página de tickets
                                navigate('/tickets');
                              }}
                              style={{ fontSize: '11px' }}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Ver Ticket{(i.ticketCount && i.ticketCount > 1) ? 's' : ''}
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary mt-2 w-100"
                              onClick={() => {
                                // Navegar a tickets con el incidentId en el query
                                navigate(`/tickets?createFor=${i.uuid}`);
                              }}
                              style={{ fontSize: '11px' }}
                            >
                              <i className="fas fa-plus me-1"></i>
                              Crear Ticket
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {/* Device Markers */}
            {devices.filter(d => visibleDeviceTypes.has(d.type)).map((device) => {
              const config = getDeviceConfig(device.type);
              const statusLabel = device.status === 'ACTIVE' ? 'Activo' : device.status === 'INACTIVE' ? 'Inactivo' : 'Mantenimiento';
              return (
                <Marker 
                  key={`device-${device.id}`} 
                  position={[device.latitude, device.longitude]} 
                  icon={createDeviceIcon(device.type, device.status)}
                >
                  <Popup>
                    <div style={{ fontSize: '12px' }}>
                      <strong>{config.label}</strong>
                      <br />
                      <span style={{ fontSize: '11px', color: '#6c757d' }}>ID: {device.id}</span>
                      <br />
                      <br />
                      <strong>Marca:</strong> {device.brand}
                      <br />
                      <strong>Estado:</strong> <span style={{ color: getDeviceStatusColor(device.status), fontWeight: 'bold' }}>{statusLabel}</span>
                      <br />
                      <strong>Año instalación:</strong> {device.installationYear}
                      <br />
                      <strong>Año fabricación:</strong> {device.manufacturingYear}
                      <br />
                      <strong>IP:</strong> {device.ipAddress}
                      <br />
                      <strong>Usuario:</strong> {device.username}
                      <br />
                      <br />
                      <span style={{ fontSize: '11px', color: '#6c757d' }}>
                        Lat: {device.latitude.toFixed(6)}, Lng: {device.longitude.toFixed(6)}
                      </span>
                      {isAdmin && (
                        <>
                          <br />
                          <button
                            className="btn btn-sm btn-primary mt-2 w-100"
                            onClick={() => {
                              navigate('/admin?tab=devices');
                            }}
                            style={{ fontSize: '11px' }}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Administrar
                          </button>
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
