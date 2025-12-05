import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Ticket, CreateTicketResponse } from './interfaces/ticket.interface';
import { TicketsStorageService } from './tickets-storage.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly aiService: AiService,
    private readonly storageService: TicketsStorageService,
  ) {}

  async createTicket(message: string): Promise<CreateTicketResponse> {
    const startTime = Date.now();

    // Шаг 1: Классификация через OpenAI
    console.log('🔍 Классификация заявки...');
    const classification = await this.aiService.classifyTicket(message);
    console.log('✅ Классификация:', classification);

    // Создаем тикет
    const ticket: Ticket = {
      id: this.storageService.getNextId(),
      message,
      category: classification.category,
      department: classification.department,
      priority: classification.priority,
      is_simple: classification.is_simple,
      status: 'new',
      autoSolved: false,
      createdAt: new Date(),
    };

    let reply = '';
    let autoSolved = false;

    // Шаг 2: Проверяем, типовая ли проблема
    if (classification.is_simple) {
      console.log('⚡ Проблема типовая - ищем авторешение...');
      
      // Шаг 3: Получаем авторешение
      const autoSolution = await this.aiService.getAutoSolution(message, classification.category);
      
      ticket.autoSolution = autoSolution;
      ticket.status = 'closed_auto';
      ticket.autoSolved = true;
      ticket.resolvedAt = new Date();
      const responseTime = Math.floor((Date.now() - startTime) / 1000);
      ticket.responseTime = responseTime;

      reply = `✅ Ваш запрос решён автоматически!\n\n${autoSolution}\n\nЕсли проблема останется — просто ответьте в чат, и заявка откроется снова.`;
      autoSolved = true;

      console.log('✅ Авторешение найдено, тикет закрыт');
    } else {
      console.log('📋 Проблема сложная - создаем summary и черновик...');
      
      // Шаг 4: Создаем summary
      const summary = await this.aiService.createSummary(message, classification);
      ticket.summary = summary;

      // Шаг 5: Создаем черновик ответа
      const draftResponse = await this.aiService.createDraftResponse(message, summary, classification.department);
      ticket.draftResponse = draftResponse;

      ticket.status = 'in-progress';

      reply = `Ваше обращение получено и передано в отдел "${classification.department}". Специалисты свяжутся с вами в ближайшее время.`;
      
      console.log('✅ Тикет создан, отправлен в отдел');
    }

    // Сохраняем тикет в JSON базу данных
    this.storageService.addTicket(ticket);

    return {
      ticket,
      reply,
      autoSolved,
    };
  }

  getAllTickets(): Ticket[] {
    return this.storageService.getAllTickets();
  }

  getTicketById(id: number): Ticket | undefined {
    return this.storageService.getTicketById(id);
  }

  // Получить только сложные тикеты (TODO-лист для операторов)
  getComplexTickets(): Ticket[] {
    const tickets = this.storageService.getAllTickets();
    return tickets.filter(t => !t.is_simple && t.status === 'in-progress');
  }

  // Обновить черновик ответа
  updateDraftResponse(id: number, draftResponse: string): boolean {
    return this.storageService.updateTicket(id, { draftResponse });
  }

  // Отметить тикет как решенный
  resolveTicket(id: number): boolean {
    return this.storageService.updateTicket(id, {
      status: 'resolved',
      resolvedAt: new Date(),
    });
  }

  getDashboardMetrics() {
    const tickets = this.storageService.getAllTickets();
    const totalTickets = tickets.length;
    const autoSolved = tickets.filter(t => t.autoSolved).length;
    const autoSolvedPercent = totalTickets > 0 ? Math.round((autoSolved / totalTickets) * 100) : 0;
    
    const responseTimes = tickets
      .filter(t => t.responseTime !== undefined)
      .map(t => t.responseTime!);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    const correctClassifications = tickets.filter(t => t.classificationCorrect !== false).length;
    const classificationAccuracy = totalTickets > 0
      ? Math.round((correctClassifications / totalTickets) * 100) / 100
      : 1.0;

    const routingErrors = tickets.filter(t => t.routingError).length;

    return {
      totalTickets,
      autoSolved,
      autoSolvedPercent,
      avgResponseTime: avgResponseTime > 0 ? `${avgResponseTime} сек` : '0 сек',
      classificationAccuracy,
      routingErrors,
    };
  }
}

