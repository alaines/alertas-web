// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ticketService from '../services/ticket.service';
import deviceService from '../services/device.service';
import { fetchIncidents } from '../api/incidents';

interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  totalDevices: number;
  activeDevices: number;
  maintenanceDevices: number;
  avgResolutionTime: number; // en horas
  ticketsByPriority: { [key: string]: number };
  incidentsByType: { [key: string]: number };
  devicesByType: { [key: string]: number };
  recentActivity: Array<{
    id: number;
    type: 'incident' | 'ticket' | 'device';
    description: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isOperator } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate, selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [incidents, tickets, devices] = await Promise.all([
        fetchIncidents({ status: 'active', limit: 500 }),
        ticketService.getAllTickets(),
        deviceService.getAllDevices(),
      ]);

      // Filtrar por período
      const now = new Date();
      const periodStart = new Date();
      if (selectedPeriod === 'today') {
        periodStart.setHours(0, 0, 0, 0);
      } else if (selectedPeriod === 'week') {
        periodStart.setDate(now.getDate() - 7);
      } else {
        periodStart.setMonth(now.getMonth() - 1);
      }

      const filteredTickets = tickets.filter(t => 
        new Date(t.createdAt) >= periodStart
      );

      // Calcular estadísticas
      const openTickets = filteredTickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = filteredTickets.filter(t => t.status === 'IN_PROGRESS').length;
      const closedTickets = filteredTickets.filter(t => t.status === 'DONE').length;

      // Calcular tiempo promedio de resolución (usando updatedAt como aproximación para tickets completados)
      const resolvedTickets = filteredTickets.filter(t => t.status === 'DONE');
      const totalResolutionTime = resolvedTickets.reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const updated = new Date(ticket.updatedAt).getTime();
        return acc + (updated - created);
      }, 0);
      const avgResolutionTime = resolvedTickets.length > 0 
        ? totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60) // convertir a horas
        : 0;

      // Agrupar por prioridad
      const ticketsByPriority = filteredTickets.reduce((acc, ticket) => {
        const priority = ticket.priority?.toString() || 'Sin prioridad';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Agrupar incidentes por tipo
      const incidentsByType = incidents.reduce((acc, incident) => {
        acc[incident.type] = (acc[incident.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Agrupar dispositivos por tipo
      const devicesByType = devices.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Actividad reciente
      const recentActivity = [
        ...filteredTickets.slice(0, 5).map(t => ({
          id: t.id,
          type: 'ticket' as const,
          description: `Ticket #${t.id} - ${t.title}`,
          timestamp: t.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        totalIncidents: incidents.length,
        activeIncidents: incidents.length,
        totalTickets: filteredTickets.length,
        openTickets,
        inProgressTickets,
        closedTickets,
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'ACTIVE').length,
        maintenanceDevices: devices.filter(d => d.status === 'MAINTENANCE').length,
        avgResolutionTime,
        ticketsByPriority,
        incidentsByType,
        devicesByType,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return t('dashboard.today');
      case 'week': return t('dashboard.lastWeek');
      case 'month': return t('dashboard.lastMonth');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white border-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', boxSizing: 'border-box', height: '60px', flexShrink: 0 }}>
        {/* Logo y Menú de Sistema a la izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-map-marker-alt" style={{ fontSize: '24px' }}></i>
            ALERTAS VIALES
          </div>

          {/* Menú de Sistema */}
          <nav className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '14px' }}
              onClick={() => navigate('/map')}
            >
              <i className="fas fa-map me-2"></i>
              Mapa
            </button>
            <button 
              className="btn btn-sm btn-primary"
              style={{ fontSize: '14px' }}
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

        {/* Usuario a la derecha */}
        <div className="d-flex gap-3 align-items-center" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div className="d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0056b3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-user" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              <span>{user?.username || 'Usuario'}</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-sm btn-outline-danger" style={{ fontSize: '14px' }}>
            <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Period Selector */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{t('dashboard.statistics')} - {getPeriodLabel()}</h4>
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${selectedPeriod === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPeriod('today')}
            >
              {t('dashboard.today')}
            </button>
            <button 
              className={`btn btn-sm ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPeriod('week')}
            >
              {t('dashboard.week')}
            </button>
            <button 
              className={`btn btn-sm ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPeriod('month')}
            >
              {t('dashboard.month')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {/* Incidentes Activos */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="text-muted mb-0">{t('dashboard.activeIncidents')}</h6>
                  <i className="fas fa-exclamation-circle" style={{ fontSize: '24px', color: '#dc3545' }}></i>
                </div>
                <h2 className="mb-0">{stats?.activeIncidents}</h2>
                <small className="text-muted">{t('dashboard.realTime')}</small>
              </div>
            </div>
          </div>

          {/* Tickets Abiertos */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="text-muted mb-0">{t('dashboard.openTickets')}</h6>
                  <i className="fas fa-ticket-alt" style={{ fontSize: '24px', color: '#ffc107' }}></i>
                </div>
                <h2 className="mb-0">{stats?.openTickets}</h2>
                <small className="text-muted">{t('dashboard.pending')}</small>
              </div>
            </div>
          </div>

          {/* Tickets En Progreso */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="text-muted mb-0">{t('dashboard.inProgress')}</h6>
                  <i className="fas fa-spinner" style={{ fontSize: '24px', color: '#0056b3' }}></i>
                </div>
                <h2 className="mb-0">{stats?.inProgressTickets}</h2>
                <small className="text-muted">{t('dashboard.beingAttended')}</small>
              </div>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="text-muted mb-0">{t('dashboard.avgTime')}</h6>
                  <i className="fas fa-clock" style={{ fontSize: '24px', color: '#28a745' }}></i>
                </div>
                <h2 className="mb-0">{stats?.avgResolutionTime.toFixed(1)}h</h2>
                <small className="text-muted">{t('dashboard.resolution')}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-3 mb-4">
          {/* Tickets por Estado */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">{t('dashboard.ticketStatus')}</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{t('dashboard.open')}</span>
                    <strong>{stats?.openTickets}</strong>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${(stats?.openTickets || 0) / (stats?.totalTickets || 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{t('dashboard.inProgress')}</span>
                    <strong>{stats?.inProgressTickets}</strong>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${(stats?.inProgressTickets || 0) / (stats?.totalTickets || 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>{t('dashboard.closed')}</span>
                    <strong>{stats?.closedTickets}</strong>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${(stats?.closedTickets || 0) / (stats?.totalTickets || 1) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incidentes por Tipo */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">{t('dashboard.incidentsByType')}</h6>
              </div>
              <div className="card-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {Object.entries(stats?.incidentsByType || {}).map(([type, count]) => (
                  <div key={type} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize: '14px' }}>{type}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${(count / (stats?.totalIncidents || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dispositivos y Actividad */}
        <div className="row g-3">
          {/* Dispositivos */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">{t('dashboard.deviceStatus')}</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <h3 className="mb-0 text-success">{stats?.activeDevices}</h3>
                    <small className="text-muted">{t('dashboard.active')}</small>
                  </div>
                  <div className="col-4">
                    <h3 className="mb-0 text-warning">{stats?.maintenanceDevices}</h3>
                    <small className="text-muted">{t('dashboard.maintenance')}</small>
                  </div>
                  <div className="col-4">
                    <h3 className="mb-0 text-secondary">
                      {(stats?.totalDevices || 0) - (stats?.activeDevices || 0) - (stats?.maintenanceDevices || 0)}
                    </h3>
                    <small className="text-muted">{t('dashboard.inactive')}</small>
                  </div>
                </div>
                <hr />
                {Object.entries(stats?.devicesByType || {}).map(([type, count]) => (
                  <div key={type} className="d-flex justify-content-between mb-2">
                    <span>{type}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">{t('dashboard.recentActivity')}</h6>
              </div>
              <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {stats?.recentActivity.length === 0 ? (
                  <p className="text-muted text-center">{t('dashboard.noActivity')}</p>
                ) : (
                  stats?.recentActivity.map((activity) => (
                    <div key={`${activity.type}-${activity.id}`} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                      <div>
                        <i className={`fas fa-${activity.type === 'ticket' ? 'ticket-alt' : 'exclamation-circle'}`} 
                           style={{ color: '#0056b3' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{activity.description}</div>
                        <small className="text-muted">
                          {new Date(activity.timestamp).toLocaleString('es-PE')}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
