import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [TicketsModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}

