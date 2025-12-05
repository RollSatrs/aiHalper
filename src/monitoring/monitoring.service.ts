import { Injectable } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly ticketsService: TicketsService) {}

  async getSystemHealth() {
    try {
      const metrics = await this.ticketsService.getDashboardMetrics();
      
      // Проверяем здоровье системы
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);

      return {
        status: 'healthy',
        uptime: `${uptimeHours}ч ${uptimeMinutes}м`,
        uptimeSeconds: Math.floor(uptime),
        metrics: {
          totalTickets: metrics.totalTickets,
          autoSolvedPercent: metrics.autoSolvedPercent,
          avgResponseTime: metrics.avgResponseTime,
          classificationAccuracy: metrics.classificationAccuracy,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'degraded',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getSLAMetrics() {
    try {
      const metrics = await this.ticketsService.getDashboardMetrics();
      
      // Вычисляем SLA метрики
      const totalTickets = metrics.totalTickets;
      const autoSolved = metrics.autoSolved;
      
      // Целевой SLA: 80% тикетов решены в течение 24 часов
      // Для демонстрации используем авторешение как показатель
      const slaTarget = 80; // %
      const slaAchieved = totalTickets > 0 
        ? Math.round((autoSolved / totalTickets) * 100)
        : 100;

      return {
        slaTarget,
        slaAchieved,
        slaStatus: slaAchieved >= slaTarget ? 'meeting' : 'below_target',
        averageResponseTime: metrics.avgResponseTime,
        autoResolutionRate: metrics.autoSolvedPercent,
        classificationAccuracy: (metrics.classificationAccuracy * 100).toFixed(1) + '%',
        totalProcessed: totalTickets,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

