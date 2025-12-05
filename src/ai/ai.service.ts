import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async ask(message: string) {
    return {
      reply: `Вы сказали: ${message}`,
    };
  }
}
