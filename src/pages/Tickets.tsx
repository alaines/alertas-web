// src/pages/Tickets.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticket.service';
import type { Ticket, TicketStatus, CreateTicketDto, ChangeTicketStatusDto } from '../types/ticket.types';

export default function Tickets() {
  const { user, logout, isOperator } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, done: 0 });

  // Form states
  const [createForm, setCreateForm] = useState<CreateTicketDto>({
    incidentId: 0,
    title: '',
    description: '',
    priority: 3,
    assignedTo: ''
  });
  const [commentText, setCommentText] = useState('');
  const [statusChangeData, setStatusChangeData] = useState<ChangeTicketStatusDto>({ status: 'OPEN' as TicketStatus, message: '' });

  useEffect(() => {
    loadTickets();
    
    // Si hay un query param createFor, abrir modal de creación con ese incidentId
    const createForIncident = searchParams.get('createFor');
    if (createForIncident && isOperator) {
      setCreateForm({
        incidentId: parseInt(createForIncident),
        title: '',
        description: '',
        priority: 3,
        assignedTo: ''
      });
      setShowCreateModal(true);
      // Limpiar el query param
      searchParams.delete('createFor');
    }
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = filterStatus !== 'ALL' ? { status: filterStatus as TicketStatus } : {};
      const data = await ticketService.listTickets(filters);
      setTickets(data);

      // Calcular estadísticas
      const statsData = {
        total: data.length,
        open: data.filter(t => t.status === 'OPEN').length,
        inProgress: data.filter(t => t.status === 'IN_PROGRESS').length,
        done: data.filter(t => t.status === 'DONE').length,
      };
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!createForm.title || !createForm.incidentId) {
      alert('El título y el ID del incidente son obligatorios');
      return;
    }

    try {
      await ticketService.createTicket(createForm);
      setShowCreateModal(false);
      setCreateForm({
        incidentId: 0,
        title: '',
        description: '',
        priority: 3,
        assignedTo: ''
      });
      loadTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear ticket');
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      const fullTicket = await ticketService.getTicket(ticket.id);
      setSelectedTicket(fullTicket);
      setShowDetailModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cargar detalles del ticket');
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedTicket) return;

    try {
      await ticketService.changeStatus(selectedTicket.id, statusChangeData);
      setStatusChangeData({ status: 'OPEN' as TicketStatus, message: '' });
      await handleViewTicket(selectedTicket); // Recargar ticket
      loadTickets(); // Actualizar lista
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentText.trim()) return;

    try {
      await ticketService.addComment(selectedTicket.id, { message: commentText });
      setCommentText('');
      await handleViewTicket(selectedTicket); // Recargar ticket
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al agregar comentario');
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const badges = {
      OPEN: 'bg-primary',
      IN_PROGRESS: 'bg-warning',
      DONE: 'bg-success'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusText = (status: TicketStatus) => {
    const texts = {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En Progreso',
      DONE: 'Completado'
    };
    return texts[status] || status;
  };

  const getPriorityBadge = (priority: number | null) => {
    if (!priority) return 'bg-secondary';
    if (priority >= 4) return 'bg-danger';
    if (priority === 3) return 'bg-warning';
    return 'bg-info';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <i className="fas fa-ticket-alt me-2"></i>
              Gestión de Tickets
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

      <div className="container-fluid p-4" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
        {/* Estadísticas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="display-4 text-primary">{stats.total}</h3>
                <p className="text-muted mb-0">Total Tickets</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="display-4 text-primary">{stats.open}</h3>
                <p className="text-muted mb-0">Abiertos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="display-4 text-warning">{stats.inProgress}</h3>
                <p className="text-muted mb-0">En Progreso</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="display-4 text-success">{stats.done}</h3>
                <p className="text-muted mb-0">Completados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">Todos los estados</option>
              <option value="OPEN">Abiertos</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="DONE">Completados</option>
            </select>
          </div>
          {isOperator && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Nuevo Ticket
            </button>
          )}
        </div>

        {/* Tabla de Tickets */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>No hay tickets para mostrar</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Incidente</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Asignado a</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>
                          <strong>{ticket.title}</strong>
                          {ticket.description && (
                            <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                              {ticket.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            Incidente #{ticket.incidentId}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                            P{ticket.priority ?? 0}
                          </span>
                        </td>
                        <td>
                          {ticket.assignedTo ? (
                            <span className="small">
                              <i className="fas fa-user me-1"></i>
                              {ticket.assignedTo}
                            </span>
                          ) : (
                            <span className="text-muted small">Sin asignar</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewTicket(ticket)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear Ticket */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>
                  Crear Nuevo Ticket
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">ID del Incidente *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={createForm.incidentId || ''}
                    onChange={(e) => setCreateForm({ ...createForm, incidentId: parseInt(e.target.value) || 0 })}
                    placeholder="Ej: 123"
                  />
                  <small className="text-muted">El incidente debe existir en el sistema</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Ej: Verificar señalización en la zona"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Detalles adicionales del ticket..."
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Prioridad</label>
                    <select
                      className="form-select"
                      value={createForm.priority}
                      onChange={(e) => setCreateForm({ ...createForm, priority: parseInt(e.target.value) })}
                    >
                      <option value="1">1 - Baja</option>
                      <option value="2">2 - Media</option>
                      <option value="3">3 - Normal</option>
                      <option value="4">4 - Alta</option>
                      <option value="5">5 - Crítica</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Asignar a</label>
                    <input
                      type="text"
                      className="form-control"
                      value={createForm.assignedTo}
                      onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                      placeholder="Usuario o email"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateTicket}>
                  <i className="fas fa-save me-2"></i>
                  Crear Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Ticket */}
      {showDetailModal && selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-ticket-alt me-2"></i>
                  Ticket #{selectedTicket.id} - {selectedTicket.title}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    {/* Información del Ticket */}
                    <div className="card mb-3">
                      <div className="card-header">
                        <strong>Información del Ticket</strong>
                      </div>
                      <div className="card-body">
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Estado:</div>
                          <div className="col-sm-9">
                            <span className={`badge ${getStatusBadge(selectedTicket.status)}`}>
                              {getStatusText(selectedTicket.status)}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Prioridad:</div>
                          <div className="col-sm-9">
                            <span className={`badge ${getPriorityBadge(selectedTicket.priority)}`}>
                              Prioridad {selectedTicket.priority ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Descripción:</div>
                          <div className="col-sm-9">{selectedTicket.description || 'Sin descripción'}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Asignado a:</div>
                          <div className="col-sm-9">{selectedTicket.assignedTo || 'Sin asignar'}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Creado por:</div>
                          <div className="col-sm-9">{selectedTicket.createdBy}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Creado:</div>
                          <div className="col-sm-9">{formatDate(selectedTicket.createdAt)}</div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-sm-3 text-muted">Actualizado:</div>
                          <div className="col-sm-9">{formatDate(selectedTicket.updatedAt)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Historial de Eventos */}
                    <div className="card">
                      <div className="card-header">
                        <strong>Historial de Eventos</strong>
                      </div>
                      <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {selectedTicket.events && selectedTicket.events.length > 0 ? (
                          <div className="timeline">
                            {selectedTicket.events.map((event) => (
                              <div key={event.id} className="mb-3 pb-3 border-bottom">
                                <div className="d-flex justify-content-between">
                                  <strong className="text-primary">{event.eventType}</strong>
                                  <small className="text-muted">{formatDate(event.createdAt)}</small>
                                </div>
                                <div className="small text-muted">Por: {event.createdBy}</div>
                                {event.fromStatus && event.toStatus && (
                                  <div className="small">
                                    <span className={`badge ${getStatusBadge(event.fromStatus)}`}>
                                      {getStatusText(event.fromStatus)}
                                    </span>
                                    <i className="fas fa-arrow-right mx-2"></i>
                                    <span className={`badge ${getStatusBadge(event.toStatus)}`}>
                                      {getStatusText(event.toStatus)}
                                    </span>
                                  </div>
                                )}
                                {event.message && (
                                  <div className="mt-2 p-2 bg-light rounded">
                                    <i className="fas fa-comment me-2"></i>
                                    {event.message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted text-center">No hay eventos registrados</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Panel de Acciones */}
                  <div className="col-md-4">
                    {isOperator && (
                      <>
                        {/* Cambiar Estado */}
                        <div className="card mb-3">
                          <div className="card-header">
                            <strong>Cambiar Estado</strong>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <select
                                className="form-select form-select-sm"
                                value={statusChangeData.status}
                                onChange={(e) => setStatusChangeData({ ...statusChangeData, status: e.target.value as any })}
                              >
                                <option value="OPEN">Abierto</option>
                                <option value="IN_PROGRESS">En Progreso</option>
                                <option value="DONE">Completado</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <textarea
                                className="form-control form-control-sm"
                                rows={2}
                                placeholder="Nota (opcional)"
                                value={statusChangeData.message}
                                onChange={(e) => setStatusChangeData({ ...statusChangeData, message: e.target.value })}
                              />
                            </div>
                            <button 
                              className="btn btn-primary btn-sm w-100"
                              onClick={handleChangeStatus}
                            >
                              <i className="fas fa-check me-2"></i>
                              Actualizar Estado
                            </button>
                          </div>
                        </div>

                        {/* Agregar Comentario */}
                        <div className="card">
                          <div className="card-header">
                            <strong>Agregar Comentario</strong>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <textarea
                                className="form-control form-control-sm"
                                rows={3}
                                placeholder="Escribe un comentario..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />
                            </div>
                            <button 
                              className="btn btn-secondary btn-sm w-100"
                              onClick={handleAddComment}
                              disabled={!commentText.trim()}
                            >
                              <i className="fas fa-comment me-2"></i>
                              Agregar Comentario
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Info del Incidente */}
                    {selectedTicket.incident && (
                      <div className="card mt-3">
                        <div className="card-header">
                          <strong>Incidente Relacionado</strong>
                        </div>
                        <div className="card-body">
                          <p className="mb-1"><strong>ID:</strong> {selectedTicket.incident.id}</p>
                          <p className="mb-1"><strong>UUID:</strong> {selectedTicket.incident.uuid}</p>
                          <p className="mb-1"><strong>Tipo:</strong> {selectedTicket.incident.type}</p>
                          <p className="mb-1"><strong>Ubicación:</strong> {selectedTicket.incident.city}, {selectedTicket.incident.street}</p>
                          <button 
                            className="btn btn-sm btn-outline-primary w-100 mt-2"
                            onClick={() => {
                              setShowDetailModal(false);
                              navigate('/map');
                            }}
                          >
                            <i className="fas fa-map-marker-alt me-2"></i>
                            Ver en Mapa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
