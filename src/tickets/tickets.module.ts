import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsDbService } from './tickets-db.service';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsDbService],
  exports: [TicketsService],
})
export class TicketsModule {}

