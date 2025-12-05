import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { TicketsModule } from './tickets/tickets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      expandVariables: true,
    }),
    DatabaseModule,
    AuthModule,
    AiModule,
    TicketsModule,
    DashboardModule,
    MonitoringModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
