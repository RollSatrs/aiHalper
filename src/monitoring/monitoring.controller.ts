import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { OperatorGuard } from '../auth/guards/operator.guard';

@Controller('api/monitoring')
@UseGuards(OperatorGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  async getHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('sla')
  async getSLA() {
    return this.monitoringService.getSLAMetrics();
  }
}

