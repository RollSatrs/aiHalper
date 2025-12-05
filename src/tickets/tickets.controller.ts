import { Controller, Post, Body, Get, Param, Put, Patch } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('create')
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto.message);
  }

  @Get('complex')
  getComplexTickets() {
    return this.ticketsService.getComplexTickets();
  }

  @Patch(':id/draft')
  async updateDraft(@Param('id') id: string, @Body('draftResponse') draftResponse: string) {
    const success = this.ticketsService.updateDraftResponse(+id, draftResponse);
    return { success, message: success ? 'Черновик обновлен' : 'Тикет не найден' };
  }

  @Put(':id/resolve')
  async resolveTicket(@Param('id') id: string) {
    const success = this.ticketsService.resolveTicket(+id);
    return { success, message: success ? 'Тикет закрыт' : 'Тикет не найден' };
  }

  @Get(':id')
  getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(+id);
  }

  @Get()
  getAllTickets() {
    return this.ticketsService.getAllTickets();
  }
}

