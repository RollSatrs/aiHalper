import { Controller, Get } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getDashboardMetrics() {
    return this.ticketsService.getDashboardMetrics();
  }
}

