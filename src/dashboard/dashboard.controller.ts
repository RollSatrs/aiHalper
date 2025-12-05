import { Controller, Get, UseGuards } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { OperatorGuard } from '../auth/guards/operator.guard';

@Controller('api/dashboard')
@UseGuards(OperatorGuard)
export class DashboardController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getDashboardMetrics() {
    return this.ticketsService.getDashboardMetrics();
  }
}

