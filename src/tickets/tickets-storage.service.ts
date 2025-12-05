import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Ticket } from './interfaces/ticket.interface';

@Injectable()
export class TicketsStorageService implements OnModuleInit {
  private readonly dataFilePath: string;
  private tickets: Ticket[] = [];
  private ticketIdCounter = 1;

  constructor() {
    // Создаем путь к файлу данных в корне проекта
    this.dataFilePath = path.join(process.cwd(), 'data', 'tickets.json');
    this.ensureDataDirectory();
  }

  onModuleInit() {
    this.loadTickets();
  }

  private ensureDataDirectory() {
    const dataDir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Загрузка тикетов из JSON файла
  private loadTickets(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        this.tickets = (data.tickets || []).map((ticket: any) => ({
          ...ticket,
          createdAt: new Date(ticket.createdAt),
          resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined,
        }));
        
        this.ticketIdCounter = data.ticketIdCounter || 1;
        console.log(`✅ Загружено ${this.tickets.length} тикетов из базы данных`);
      } else {
        console.log('📝 Файл базы данных не найден, создан новый');
        this.saveTickets();
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки тикетов из файла:', error);
      this.tickets = [];
      this.ticketIdCounter = 1;
    }
  }

  // Сохранение тикетов в JSON файл
  private saveTickets(): void {
    try {
      const data = {
        tickets: this.tickets,
        ticketIdCounter: this.ticketIdCounter,
        lastUpdated: new Date().toISOString(),
      };
      
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Ошибка сохранения тикетов в файл:', error);
    }
  }

  // Получить все тикеты
  getAllTickets(): Ticket[] {
    return [...this.tickets];
  }

  // Получить тикет по ID
  getTicketById(id: number): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  // Добавить новый тикет
  addTicket(ticket: Ticket): void {
    ticket.id = this.ticketIdCounter++;
    this.tickets.push(ticket);
    this.saveTickets();
    console.log(`💾 Тикет #${ticket.id} сохранен в базу данных`);
  }

  // Обновить тикет
  updateTicket(id: number, updates: Partial<Ticket>): boolean {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    
    this.tickets[index] = { ...this.tickets[index], ...updates };
    this.saveTickets();
    console.log(`💾 Тикет #${id} обновлен в базе данных`);
    return true;
  }

  // Удалить тикет (опционально)
  deleteTicket(id: number): boolean {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }
    
    this.tickets.splice(index, 1);
    this.saveTickets();
    console.log(`💾 Тикет #${id} удален из базы данных`);
    return true;
  }

  // Получить следующий ID
  getNextId(): number {
    return this.ticketIdCounter;
  }
}

