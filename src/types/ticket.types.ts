// src/types/ticket.types.ts
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export type TicketEventType = 
  | 'CREATED' 
  | 'COMMENT' 
  | 'STATUS_CHANGED' 
  | 'UPDATED' 
  | 'ASSIGNED' 
  | 'UNASSIGNED' 
  | 'CLOSED';

export type TicketSource = 'WAZE' | 'PHONE_CALL' | 'WHATSAPP' | 'INSPECTOR' | 'OTHER';

export interface Ticket {
  id: number;
  incidentUuid: string | null;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: number | null;
  source: TicketSource;
  incidentType: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | { id: number; username: string; fullName: string };
  assignedTo: string | { id: number; username: string; fullName: string } | null;
  deletedAt: string | null;
  // Relaciones
  incident?: {
    id: number;
    uuid: string;
    type: string;
    city: string | null;
    street: string | null;
    lat: number;
    lon: number;
  };
  events?: TicketEvent[];
}

export interface TicketEvent {
  id: number;
  ticketId: number;
  eventType: TicketEventType;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  message: string | null;
  payload: Record<string, any> | null;
  createdAt: string;
  createdBy: string | { id: number; username: string; fullName: string };
}

export interface CreateTicketDto {
  incidentUuid?: string | null;
  title: string;
  description?: string;
  priority?: number;
  assignedToUserId?: number;
  source: TicketSource;
  incidentType?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: number;
  assignedTo?: string;
}

export interface ChangeTicketStatusDto {
  status: TicketStatus;
  message?: string;
}

export interface AddTicketCommentDto {
  message: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  incidentId?: number;
  createdBy?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}
