import { Injectable, Optional } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Ticket, CreateTicketResponse } from './interfaces/ticket.interface';
import { TicketsDbService } from './tickets-db.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly aiService: AiService,
    private readonly dbService: TicketsDbService,
  ) {}

  async createTicket(message: string, userId?: number | null): Promise<CreateTicketResponse> {
    const startTime = Date.now();

    // Шаг 1: Автоматическая классификация и маршрутизация через OpenAI
    console.log('🔍 [АВТОМАТИЧЕСКАЯ КЛАССИФИКАЦИЯ] Начинаю анализ заявки...');
    const classificationStartTime = Date.now();
    const classification = await this.aiService.classifyTicket(message);
    const classificationTime = Date.now() - classificationStartTime;
    
    console.log('✅ [КЛАССИФИКАЦИЯ ЗАВЕРШЕНА]', {
      category: classification.category,
      department: classification.department,
      priority: classification.priority,
      isSimple: classification.is_simple,
      time: `${classificationTime}ms`
    });
    console.log('📤 [АВТОМАТИЧЕСКАЯ МАРШРУТИЗАЦИЯ] Направление в отдел:', classification.department);

    let reply = '';
    let autoSolved = false;
    let ticketData: any = {
      userId: userId || null,
      message,
      category: classification.category,
      department: classification.department,
      priority: classification.priority,
      isSimple: classification.is_simple,
      status: 'new' as const,
      autoSolved: false,
    };

    // Шаг 2: Проверяем, типовая ли проблема
    if (classification.is_simple) {
      console.log('⚡ Проблема типовая - ищем авторешение...');
      
      // Шаг 3: Получаем авторешение
      const autoSolution = await this.aiService.getAutoSolution(message, classification.category);
      
      ticketData.autoSolution = autoSolution;
      ticketData.status = 'closed_auto';
      ticketData.autoSolved = true;
      const responseTime = Math.floor((Date.now() - startTime) / 1000);
      ticketData.responseTime = responseTime;

      reply = `✅ Ваш запрос решён автоматически! 👌\n\n📋 Инструкция по решению:\n\n${autoSolution}\n\n💡 Если проблема останется — просто ответьте в чат, и заявка откроется снова.`;
      autoSolved = true;

      console.log('✅ [АВТОРЕШЕНИЕ] Типовая проблема решена автоматически, тикет закрыт');
    } else {
      console.log('📋 Проблема сложная - создаем summary и черновик...');
      
      // Шаг 4: Создаем summary
      const summary = await this.aiService.createSummary(message, classification);
      ticketData.summary = summary;

      // Шаг 5: Создаем черновик ответа
      const draftResponse = await this.aiService.createDraftResponse(message, summary, classification.department);
      ticketData.draftResponse = draftResponse;

      ticketData.status = 'in-progress';

      reply = `📨 Ваше обращение получено!\n\n✅ Автоматически классифицировано:\n   📋 Категория: ${classification.category}\n   🏢 Отдел: ${classification.department}\n   🔥 Приоритет: ${classification.priority}\n\n📤 Заявка автоматически направлена в отдел "${classification.department}".\n\n👨‍💼 Специалисты свяжутся с вами в ближайшее время.`;
      
      console.log('✅ [МАРШРУТИЗАЦИЯ ЗАВЕРШЕНА] Тикет создан и отправлен в отдел:', classification.department);
    }

    // Сохраняем тикет в PostgreSQL
    const savedTicket = await this.dbService.createTicket(ticketData);

    // Сохраняем сообщение в историю
    await this.dbService.createMessage({
      userId: userId || null,
      ticketId: savedTicket.id,
      message,
      reply,
      isQuestion: true,
      isTicketCreated: true,
    });

    // Преобразуем в формат интерфейса
    const ticket: Ticket = {
      id: savedTicket.id,
      message: savedTicket.message,
      category: savedTicket.category,
      department: savedTicket.department,
      priority: savedTicket.priority,
      is_simple: savedTicket.isSimple,
      status: savedTicket.status,
      autoSolved: savedTicket.autoSolved,
      summary: savedTicket.summary || undefined,
      draftResponse: savedTicket.draftResponse || undefined,
      autoSolution: savedTicket.autoSolution || undefined,
      responseTime: savedTicket.responseTime || undefined,
      createdAt: savedTicket.createdAt,
      resolvedAt: savedTicket.resolvedAt || undefined,
    };

    return {
      ticket,
      reply,
      autoSolved,
    };
  }

  async getAllTickets() {
    const results = await this.dbService.getAllTickets();
    return results.map(result => ({
      ...result.ticket,
      user: result.user,
    }));
  }

  async getTicketById(id: number) {
    const result = await this.dbService.getTicketById(id);
    if (!result) return null;
    
    return {
      ...result.ticket,
      user: result.user,
    };
  }

  async getComplexTickets() {
    const results = await this.dbService.getComplexTickets();
    return results.map(result => ({
      id: result.ticket.id,
      message: result.ticket.message,
      category: result.ticket.category,
      department: result.ticket.department,
      priority: result.ticket.priority,
      is_simple: result.ticket.isSimple,
      status: result.ticket.status,
      autoSolved: result.ticket.autoSolved,
      summary: result.ticket.summary || undefined,
      draftResponse: result.ticket.draftResponse || undefined,
      autoSolution: result.ticket.autoSolution || undefined,
      responseTime: result.ticket.responseTime || undefined,
      createdAt: result.ticket.createdAt,
      resolvedAt: result.ticket.resolvedAt || undefined,
      user: result.user || null,
    }));
  }

  async updateDraftResponse(id: number, draftResponse: string) {
    const updated = await this.dbService.updateTicket(id, { draftResponse });
    return !!updated;
  }

  async resolveTicket(id: number, operatorResponse?: string) {
    // Получаем тикет с информацией о пользователе
    const ticketResult = await this.dbService.getTicketById(id);
    if (!ticketResult || !ticketResult.ticket) {
      return false;
    }

    const ticket = ticketResult.ticket;
    const userId = ticket.userId;

    // Обновляем статус тикета
    const updated = await this.dbService.updateTicket(id, {
      status: 'resolved',
      resolvedAt: new Date(),
    });

    // Если есть ответ оператора и userId, сохраняем ответ для отправки клиенту
    if (operatorResponse && userId) {
      await this.dbService.createMessage({
        userId: userId,
        ticketId: id,
        message: '', // Оператор не задает вопрос, только отвечает
        reply: operatorResponse, // Ответ оператора клиенту
        isQuestion: false,
        isTicketCreated: false,
      });

      console.log(`📤 [ОТПРАВКА КЛИЕНТУ] Ответ отправлен пользователю #${userId} для тикета #${id}`);
      console.log(`   Пользователь: ${ticketResult.user?.name || ticketResult.user?.email || 'Неизвестен'}`);
    }

    return !!updated;
  }

  async getUserTickets(userId: number) {
    // Получаем все тикеты пользователя
    const allTickets = await this.dbService.getAllTickets();
    const userTickets = allTickets.filter(t => t.userId === userId);

    // Также получаем ответы операторов для этих тикетов
    const ticketsWithResponses = await Promise.all(
      userTickets.map(async (ticket) => {
        // Получаем ответ оператора из messages
        const messagesList = await this.dbService.getMessagesByTicketId(ticket.id);
        const operatorResponse = messagesList.find(m => !m.message.isQuestion && m.message.reply)?.message.reply;

        return {
          id: ticket.id,
          message: ticket.message,
          category: ticket.category,
          department: ticket.department,
          priority: ticket.priority,
          is_simple: ticket.isSimple,
          status: ticket.status,
          autoSolved: ticket.autoSolved,
          summary: ticket.summary || undefined,
          draftResponse: ticket.draftResponse || undefined,
          autoSolution: ticket.autoSolution || undefined,
          operatorResponse: operatorResponse || undefined, // Ответ оператора клиенту
          responseTime: ticket.responseTime || undefined,
          createdAt: ticket.createdAt,
          resolvedAt: ticket.resolvedAt || undefined,
        };
      })
    );

    return ticketsWithResponses;
  }

  async getDashboardMetrics() {
    const allTickets = await this.getAllTickets();
    const totalTickets = allTickets.length;
    const autoSolved = allTickets.filter(t => t.autoSolved).length;
    const autoSolvedPercent = totalTickets > 0 ? Math.round((autoSolved / totalTickets) * 100) : 0;
    
    const responseTimes = allTickets
      .filter(t => t.responseTime !== undefined)
      .map(t => t.responseTime!);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    const correctClassifications = allTickets.filter(t => t.classificationCorrect !== false).length;
    const classificationAccuracy = totalTickets > 0
      ? Math.round((correctClassifications / totalTickets) * 100) / 100
      : 1.0;

    const routingErrors = allTickets.filter(t => t.routingError).length;

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
