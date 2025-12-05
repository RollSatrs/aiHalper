export interface Ticket {
  id: number;
  message: string;
  category: string;
  department: string;
  priority: string;
  is_simple: boolean;
  status: 'closed_auto' | 'in-progress' | 'new' | 'resolved';
  autoSolved: boolean;
  summary?: string;
  draftResponse?: string;
  autoSolution?: string;
  responseTime?: number; // в секундах
  createdAt: Date;
  resolvedAt?: Date;
  classificationCorrect?: boolean;
  routingError?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface TicketClassification {
  category: string;
  department: string;
  priority: string;
  is_simple: boolean;
}

export interface CreateTicketResponse {
  ticket: Ticket;
  reply: string;
  autoSolved: boolean;
}

