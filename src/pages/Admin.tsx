// src/pages/Admin.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'logs'>('users');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header className="bg-primary text-white py-3 px-4 shadow-sm" style={{ flexShrink: 0 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate('/map')}
              className="btn btn-light btn-sm"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver al Mapa
            </button>
            <h1 className="h4 mb-0">
              <i className="fas fa-cog me-2"></i>
              Panel de Administración
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="small">
              <i className="fas fa-user me-2"></i>
              {user?.name}
            </span>
            <button onClick={logout} className="btn btn-light btn-sm">
              <i className="fas fa-sign-out-alt me-2"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside className="bg-light border-end" style={{ width: '250px', overflowY: 'auto' }}>
          <div className="p-3">
            <h6 className="text-muted mb-3">ADMINISTRACIÓN</h6>
            <div className="d-flex flex-column gap-2">
              <button
                className={`btn text-start ${activeTab === 'users' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users me-2"></i>
                Usuarios
              </button>
              <button
                className={`btn text-start ${activeTab === 'settings' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="fas fa-cog me-2"></i>
                Configuración
              </button>
              <button
                className={`btn text-start ${activeTab === 'logs' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setActiveTab('logs')}
              >
                <i className="fas fa-file-alt me-2"></i>
                Logs de Actividad
              </button>
            </div>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-fill p-4" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </main>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users] = useState([
    { id: 1, username: 'admin', name: 'Administrador', email: 'admin@alertas.com', role: 'admin', status: 'active' },
    { id: 2, username: 'operator1', name: 'Operador 1', email: 'op1@alertas.com', role: 'operator', status: 'active' },
    { id: 3, username: 'viewer1', name: 'Visualizador 1', email: 'view1@alertas.com', role: 'viewer', status: 'active' },
  ]);

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-danger',
      operator: 'bg-warning',
      viewer: 'bg-info'
    };
    return badges[role as keyof typeof badges] || 'bg-secondary';
  };

  const getRoleText = (role: string) => {
    const roles = {
      admin: 'Administrador',
      operator: 'Operador',
      viewer: 'Visualizador'
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Gestión de Usuarios</h2>
        <button className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <i className="fas fa-user-circle me-2 text-muted"></i>
                      {user.username}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success">Activo</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="display-4 text-danger">{users.filter(u => u.role === 'admin').length}</h3>
              <p className="text-muted mb-0">Administradores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="display-4 text-warning">{users.filter(u => u.role === 'operator').length}</h3>
              <p className="text-muted mb-0">Operadores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="display-4 text-info">{users.filter(u => u.role === 'viewer').length}</h3>
              <p className="text-muted mb-0">Visualizadores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h2 className="h4 mb-4">Configuración del Sistema</h2>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-sync me-2"></i>
                Actualización de Datos
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Intervalo de actualización (segundos)</label>
                <input type="number" className="form-control" defaultValue="60" />
                <small className="text-muted">Frecuencia con la que se actualizan los incidentes</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Tiempo de visualización incidentes cerrados (minutos)</label>
                <input type="number" className="form-control" defaultValue="5" />
                <small className="text-muted">Cuánto tiempo mostrar incidentes después de cerrados</small>
              </div>
              <button className="btn btn-primary">
                <i className="fas fa-save me-2"></i>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-map me-2"></i>
                Configuración del Mapa
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Centro del mapa (Latitud)</label>
                <input type="text" className="form-control" defaultValue="-12.0464" />
              </div>
              <div className="mb-3">
                <label className="form-label">Centro del mapa (Longitud)</label>
                <input type="text" className="form-control" defaultValue="-77.0428" />
              </div>
              <div className="mb-3">
                <label className="form-label">Zoom inicial</label>
                <input type="number" className="form-control" defaultValue="12" />
              </div>
              <button className="btn btn-primary">
                <i className="fas fa-save me-2"></i>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-key me-2"></i>
                API Keys
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Gestiona las claves de API para acceso externo</p>
              <button className="btn btn-success">
                <i className="fas fa-plus me-2"></i>
                Generar Nueva API Key
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Notificaciones
              </h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="notifEmail" defaultChecked />
                <label className="form-check-label" htmlFor="notifEmail">
                  Notificaciones por Email
                </label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="notifPush" defaultChecked />
                <label className="form-check-label" htmlFor="notifPush">
                  Notificaciones Push
                </label>
              </div>
              <button className="btn btn-primary mt-3">
                <i className="fas fa-save me-2"></i>
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTab() {
  const logs = [
    { id: 1, timestamp: '2025-12-13 10:30:15', user: 'admin', action: 'LOGIN', details: 'Inicio de sesión exitoso' },
    { id: 2, timestamp: '2025-12-13 10:32:45', user: 'operator1', action: 'VIEW_MAP', details: 'Accedió al mapa de incidentes' },
    { id: 3, timestamp: '2025-12-13 10:35:20', user: 'admin', action: 'UPDATE_SETTINGS', details: 'Actualizó configuración del sistema' },
    { id: 4, timestamp: '2025-12-13 10:40:10', user: 'viewer1', action: 'LOGIN', details: 'Inicio de sesión exitoso' },
  ];

  return (
    <div>
      <h2 className="h4 mb-4">Logs de Actividad del Sistema</h2>
      
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <i className="fas fa-clock me-2 text-muted"></i>
                      {log.timestamp}
                    </td>
                    <td>
                      <i className="fas fa-user me-2 text-muted"></i>
                      {log.user}
                    </td>
                    <td>
                      <span className="badge bg-primary">{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
