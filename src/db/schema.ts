import { pgTable, serial, varchar, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum для ролей пользователей
export const userRoleEnum = pgEnum('user_role', ['client', 'operator']);

// Enum для статусов тикетов
export const ticketStatusEnum = pgEnum('ticket_status', ['new', 'in-progress', 'closed_auto', 'resolved']);

// Таблица пользователей
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // будет хеширован
  role: userRoleEnum('role').notNull().default('client'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица тикетов
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  message: text('message').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
  isSimple: boolean('is_simple').notNull().default(false),
  status: ticketStatusEnum('status').notNull().default('new'),
  autoSolved: boolean('auto_solved').notNull().default(false),
  summary: text('summary'),
  draftResponse: text('draft_response'),
  autoSolution: text('auto_solution'),
  responseTime: integer('response_time'), // в секундах
  classificationCorrect: boolean('classification_correct'),
  routingError: boolean('routing_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// Таблица сообщений чата (для истории всех вопросов и ответов)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  ticketId: integer('ticket_id').references(() => tickets.id), // может быть null для простых вопросов
  message: text('message').notNull(),
  reply: text('reply'),
  isQuestion: boolean('is_question').notNull().default(true), // true - вопрос, false - ответ
  isTicketCreated: boolean('is_ticket_created').notNull().default(false), // был ли создан тикет
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Типы для TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

