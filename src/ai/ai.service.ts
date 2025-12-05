import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async ask(message: string) {
    // Здесь ты можешь добавить любую логику
    return {
      reply: `Вы сказали: ${message}`,
    };
  }
}
