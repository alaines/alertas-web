// src/services/ticket.service.ts
import api from '../api/axios.config';
import type {
  Ticket,
  TicketEvent,
  CreateTicketDto,
  UpdateTicketDto,
  ChangeTicketStatusDto,
  AddTicketCommentDto,
  TicketFilters
} from '../types/ticket.types';

class TicketService {
  /**
   * Crear un nuevo ticket vinculado a un incidente
   * Solo OPERATOR y ADMIN
   */
  async createTicket(dto: CreateTicketDto): Promise<Ticket> {
    const response = await api.post('/tickets', dto);
    return response.data;
  }

  /**
   * Listar tickets con filtros opcionales
   * Todos los usuarios autenticados
   */
  async listTickets(filters?: TicketFilters): Promise<Ticket[]> {
    const response = await api.get('/tickets', { params: filters });
    return response.data;
  }

  /**
   * Obtener un ticket por ID con su incidente y eventos
   * Todos los usuarios autenticados
   */
  async getTicket(id: number): Promise<Ticket> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  }

  /**
   * Actualizar campos de un ticket (título, descripción, prioridad, asignado)
   * Solo OPERATOR y ADMIN
   */
  async updateTicket(id: number, dto: UpdateTicketDto): Promise<Ticket> {
    const response = await api.patch(`/tickets/${id}`, dto);
    return response.data;
  }

  /**
   * Cambiar el estado de un ticket (OPEN -> IN_PROGRESS -> DONE)
   * Solo OPERATOR y ADMIN
   */
  async changeStatus(id: number, dto: ChangeTicketStatusDto): Promise<Ticket> {
    const response = await api.post(`/tickets/${id}/status`, dto);
    return response.data;
  }

  /**
   * Agregar un comentario al ticket
   * Solo OPERATOR y ADMIN
   */
  async addComment(id: number, dto: AddTicketCommentDto): Promise<TicketEvent> {
    const response = await api.post(`/tickets/${id}/comments`, dto);
    return response.data;
  }

  /**
   * Obtener el historial de eventos de un ticket
   * Todos los usuarios autenticados
   */
  async getTicketEvents(id: number): Promise<TicketEvent[]> {
    const response = await api.get(`/tickets/${id}/events`);
    return response.data;
  }

  /**
   * Obtener tickets por incidente
   */
  async getTicketsByIncident(incidentId: number): Promise<Ticket[]> {
    return this.listTickets({ incidentId });
  }

  /**
   * Obtener estadísticas de tickets
   */
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    done: number;
    byPriority: Record<number, number>;
  }> {
    const tickets = await this.listTickets();
    
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      done: tickets.filter(t => t.status === 'DONE').length,
      byPriority: {} as Record<number, number>
    };

    tickets.forEach(t => {
      const priority = t.priority ?? 0;
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });

    return stats;
  }
}

export default new TicketService();
