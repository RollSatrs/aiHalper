import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsStorageService } from './tickets-storage.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsStorageService],
  exports: [TicketsService],
})
export class TicketsModule {}

