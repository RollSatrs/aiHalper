import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { tickets, messages, users } from '../db/schema';
import { DATABASE_CONNECTION } from '../db/database.module';

@Injectable()
export class TicketsDbService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async createTicket(data: {
    userId: number | null;
    message: string;
    category: string;
    department: string;
    priority: string;
    isSimple: boolean;
    status: 'new' | 'in-progress' | 'closed_auto' | 'resolved';
    autoSolved: boolean;
    summary?: string;
    draftResponse?: string;
    autoSolution?: string;
    responseTime?: number;
  }) {
    const [ticket] = await this.db
      .insert(tickets)
      .values({
        userId: data.userId || null,
        message: data.message,
        category: data.category,
        department: data.department,
        priority: data.priority,
        isSimple: data.isSimple,
        status: data.status,
        autoSolved: data.autoSolved,
        summary: data.summary,
        draftResponse: data.draftResponse,
        autoSolution: data.autoSolution,
        responseTime: data.responseTime,
        resolvedAt: data.status === 'closed_auto' || data.status === 'resolved' ? new Date() : null,
      })
      .returning();

    return ticket;
  }

  async getAllTickets() {
    return await this.db
      .select({
        ticket: tickets,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketById(id: number) {
    const [result] = await this.db
      .select({
        ticket: tickets,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.id, id))
      .limit(1);

    return result || null;
  }

  async getComplexTickets() {
    return await this.db
      .select({
        ticket: tickets,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .where(
        and(
          eq(tickets.isSimple, false),
          eq(tickets.status, 'in-progress')
        )
      )
      .orderBy(desc(tickets.createdAt));
  }

  async updateTicket(id: number, updates: any) {
    const [updated] = await this.db
      .update(tickets)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();

    return updated || null;
  }

  async createMessage(data: {
    userId: number | null;
    ticketId: number | null;
    message: string;
    reply?: string;
    isQuestion: boolean;
    isTicketCreated: boolean;
  }) {
    const [message] = await this.db
      .insert(messages)
      .values(data)
      .returning();

    return message;
  }

  async getMessagesByTicketId(ticketId: number) {
    return await this.db
      .select({
        message: messages,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.ticketId, ticketId))
      .orderBy(messages.createdAt);
  }

  async getAllMessages() {
    return await this.db
      .select({
        message: messages,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        ticket: tickets,
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .leftJoin(tickets, eq(messages.ticketId, tickets.id))
      .orderBy(desc(messages.createdAt));
  }
}

