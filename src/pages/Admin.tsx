// src/pages/Admin.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import userService, { type User, type CreateUserDto, type UpdateUserDto } from '../services/user.service';
import Devices from './Devices';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'devices' | 'settings' | 'logs'>('users');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '14px' }}
              onClick={() => navigate('/tickets')}
            >
              <i className="fas fa-ticket-alt me-2"></i>
              Tickets
            </button>
            <button 
              className="btn btn-sm btn-primary"
              style={{ fontSize: '14px' }}
            >
              <i className="fas fa-cog me-2"></i>
              Administración
            </button>
          </nav>
        </div>

        {/* Usuario a la derecha */}
        <div className="d-flex gap-3 align-items-center" style={{ position: 'relative' }}>
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
                className={`btn text-start ${activeTab === 'devices' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setActiveTab('devices')}
              >
                <i className="fas fa-hdd me-2"></i>
                Periféricos
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
          {activeTab === 'devices' && <Devices />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </main>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    username: '',
    fullName: '',
    password: '',
    role: 'VIEWER',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      username: '',
      fullName: '',
      password: '',
      role: 'VIEWER',
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      password: '', // No mostrar password actual
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updateData: UpdateUserDto = {
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          role: formData.role,
        };
        await userService.updateUser(editingUser.id, updateData);
      } else {
        // Crear nuevo usuario
        await userService.createUser(formData);
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await userService.deleteUser(userId);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-danger',
      OPERATOR: 'bg-warning',
      VIEWER: 'bg-info'
    };
    return badges[role as keyof typeof badges] || 'bg-secondary';
  };

  const getRoleText = (role: string) => {
    const roles = {
      ADMIN: 'Administrador',
      OPERATOR: 'Operador',
      VIEWER: 'Visualizador'
    };
    return roles[role as keyof typeof roles] || role;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadUsers}>
          <i className="fas fa-refresh me-1"></i>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={handleCreateUser}>
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
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditUser(user)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
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
              <h3 className="display-4 text-danger">{users.filter(u => u.role === 'ADMIN').length}</h3>
              <p className="text-muted mb-0">Administradores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="display-4 text-warning">{users.filter(u => u.role === 'OPERATOR').length}</h3>
              <p className="text-muted mb-0">Operadores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="display-4 text-info">{users.filter(u => u.role === 'VIEWER').length}</h3>
              <p className="text-muted mb-0">Visualizadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Usuario *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="mb-3">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="VIEWER">Visualizador</option>
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                {editingUser && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Para cambiar la contraseña, el usuario debe usar la opción "Cambiar Contraseña" en su perfil.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveUser}>
                  <i className="fas fa-save me-2"></i>
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { language, setLanguage, t } = useLanguage();
  const [saved, setSaved] = useState(false);

  const handleLanguageChange = (newLang: 'es' | 'en') => {
    setLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="h4 mb-4">Configuración del Sistema</h2>
      
      <div className="row">
        {/* Language Settings */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-language me-2"></i>
                {t('settings.language')}
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">{t('settings.selectLanguage')}</label>
                <select 
                  className="form-select" 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as 'es' | 'en')}
                >
                  <option value="es">{t('settings.spanish')}</option>
                  <option value="en">{t('settings.english')}</option>
                </select>
              </div>
              {saved && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {t('settings.changesSaved')}
                </div>
              )}
            </div>
          </div>
        </div>

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
