import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OperatorGuard } from '../auth/guards/operator.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createTicket(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    // Получаем userId из JWT токена (если авторизован)
    const userId = req.user?.sub || null;
    return this.ticketsService.createTicket(createTicketDto.message, userId);
  }

  @Get('complex')
  @UseGuards(OperatorGuard)
  async getComplexTickets() {
    return await this.ticketsService.getComplexTickets();
  }

  @Patch(':id/draft')
  @UseGuards(OperatorGuard)
  async updateDraft(@Param('id') id: string, @Body('draftResponse') draftResponse: string) {
    const success = await this.ticketsService.updateDraftResponse(+id, draftResponse);
    return { success, message: success ? 'Черновик обновлен' : 'Тикет не найден' };
  }

  @Put(':id/resolve')
  @UseGuards(OperatorGuard)
  async resolveTicket(
    @Param('id') id: string,
    @Body() body: { response?: string }
  ) {
    // Оператор отправляет ответ клиенту
    const response = body.response || '';
    const success = await this.ticketsService.resolveTicket(+id, response);
    return { success, message: success ? 'Ответ отправлен клиенту, тикет закрыт' : 'Тикет не найден' };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Request() req) {
    // Получаем тикеты текущего пользователя
    const userId = req.user?.sub;
    return this.ticketsService.getUserTickets(userId);
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return await this.ticketsService.getTicketById(+id);
  }

  @Get()
  async getAllTickets() {
    return await this.ticketsService.getAllTickets();
  }
}

