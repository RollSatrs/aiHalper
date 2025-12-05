import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OperatorGuard } from '../auth/guards/operator.guard';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('create')
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto.message);
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
  async resolveTicket(@Param('id') id: string) {
    const success = await this.ticketsService.resolveTicket(+id);
    return { success, message: success ? 'Тикет закрыт' : 'Тикет не найден' };
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

