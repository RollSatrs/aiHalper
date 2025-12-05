import { Controller, Post, Body, Headers, Query } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';

@Controller('api/integrations')
export class IntegrationsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Единый endpoint для создания тикетов из разных источников
   * Поддерживает: email, чаты, портал, телефония
   */
  @Post('create')
  async createTicketFromSource(
    @Body() createTicketDto: CreateTicketDto,
    @Headers('x-source') source?: string,
    @Headers('x-user-email') userEmail?: string,
    @Query('source') querySource?: string,
  ) {
    // Определяем источник заявки
    const ticketSource = source || querySource || 'web';
    
    console.log(`📥 Заявка получена из источника: ${ticketSource}`);
    
    // Создаем тикет (аналогично обычному созданию)
    // В будущем здесь можно добавить логику для разных источников
    const result = await this.ticketsService.createTicket(
      createTicketDto.message,
      null // userId будет null для внешних источников
    );

    return {
      ...result,
      source: ticketSource,
      receivedAt: new Date().toISOString(),
    };
  }

  /**
   * Webhook для email интеграции
   * Принимает заявки из почты
   */
  @Post('email')
  async createTicketFromEmail(
    @Body() body: {
      from?: string;
      subject?: string;
      text?: string;
      html?: string;
      message?: string;
    },
  ) {
    // Извлекаем текст из email
    const message = body.message || body.text || body.subject || 'Без описания';
    const userEmail = body.from;

    console.log(`📧 Заявка получена из email от: ${userEmail}`);

    const result = await this.ticketsService.createTicket(message, null);

    return {
      ...result,
      source: 'email',
      userEmail,
      receivedAt: new Date().toISOString(),
    };
  }

  /**
   * Webhook для чатов (Telegram, WhatsApp, и т.д.)
   */
  @Post('chat')
  async createTicketFromChat(
    @Body() body: {
      chatId?: string;
      userId?: string;
      username?: string;
      message?: string;
      platform?: string; // 'telegram', 'whatsapp', etc.
    },
  ) {
    const message = body.message || 'Без описания';
    const platform = body.platform || 'chat';

    console.log(`💬 Заявка получена из чата (${platform}): ${body.username || body.userId}`);

    const result = await this.ticketsService.createTicket(message, null);

    return {
      ...result,
      source: platform,
      chatId: body.chatId,
      username: body.username,
      receivedAt: new Date().toISOString(),
    };
  }

  /**
   * Webhook для телефонии (IVR, звонки)
   */
  @Post('phone')
  async createTicketFromPhone(
    @Body() body: {
      phoneNumber?: string;
      transcription?: string;
      message?: string;
    },
  ) {
    const message = body.message || body.transcription || 'Звонок без записи';

    console.log(`📞 Заявка получена из телефонии: ${body.phoneNumber}`);

    const result = await this.ticketsService.createTicket(message, null);

    return {
      ...result,
      source: 'phone',
      phoneNumber: body.phoneNumber,
      receivedAt: new Date().toISOString(),
    };
  }

  /**
   * Webhook для внешнего портала
   */
  @Post('portal')
  async createTicketFromPortal(
    @Body() createTicketDto: CreateTicketDto & {
      portalUserId?: string;
      portalName?: string;
    },
  ) {
    console.log(`🌐 Заявка получена из портала: ${createTicketDto.portalName || 'external'}`);

    const result = await this.ticketsService.createTicket(
      createTicketDto.message,
      null
    );

    return {
      ...result,
      source: 'portal',
      portalName: createTicketDto.portalName,
      portalUserId: createTicketDto.portalUserId,
      receivedAt: new Date().toISOString(),
    };
  }
}

