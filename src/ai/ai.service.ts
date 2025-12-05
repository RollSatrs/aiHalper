
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('⚠️  OPENAI_API_KEY не найден в переменных окружения!');
      console.error('📝 Убедитесь, что файл .env создан в корне папки aihelper-backend');
      console.error('📝 Содержимое файла должно быть: OPENAI_API_KEY=ваш_токен');
      throw new Error(
        'OPENAI_API_KEY is not set in environment variables. Please create .env file in aihelper-backend folder with: OPENAI_API_KEY=your_token'
      );
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async ask(message: string) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты ИИ-ассистент службы поддержки Казахтелеком. Отвечай дружелюбно и помогай пользователям.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';

      return {
        reply: reply,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        reply: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
      };
    }
  }
}
