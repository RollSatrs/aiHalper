
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
    const startTime = Date.now()
    console.log('📤 Отправка запроса к OpenAI...')
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты ИИ-ассистент службы поддержки Казахтелеком. Отвечай дружелюбно, кратко и помогай пользователям. Ответ должен быть не более 2-3 предложений.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 250, // Уменьшено для более быстрого ответа
      });
      
      const responseTime = Date.now() - startTime
      console.log(`✅ Ответ получен за ${responseTime}мс`)

      const reply = completion.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';

      return {
        reply: reply,
      };
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      
      // Детальная информация об ошибке
      if (error instanceof Error) {
        console.error('Ошибка:', error.message);
        if ('response' in error) {
          console.error('Ответ API:', JSON.stringify(error.response, null, 2));
        }
      }
      
      // Более понятное сообщение об ошибке
      let errorMessage = 'Извините, произошла ошибка при обработке вашего запроса.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Ошибка аутентификации с OpenAI. Проверьте API ключ в файле .env';
        } else if (error.message.includes('429')) {
          errorMessage = 'Превышен лимит запросов к OpenAI. Попробуйте позже.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Ошибка подключения к OpenAI. Проверьте интернет-соединение.';
        }
      }
      
      return {
        reply: errorMessage + ' Попробуйте еще раз.',
      };
    }
  }

  // Классификация заявки
  async classifyTicket(message: string): Promise<{
    category: string;
    department: string;
    priority: string;
    is_simple: boolean;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты специалист по классификации заявок службы поддержки Казахтелеком. 
Проанализируй заявку и определи:

- category: категорию проблемы (например: "Сеть / Wi-Fi", "Интернет", "Телевидение", "1С", "Общая поддержка")
- department: в какой отдел направить (например: "IT Support", "Техническая поддержка", "1С Development")
- priority: приоритет ("Низкий", "Средний", "Высокий")
- is_simple: является ли проблема типовой и решаемой автоматически (true/false)

Примеры:
- "Не могу подключиться к Wi-Fi, неправильный пароль" → is_simple: true (типовая проблема)
- "После обновления сервера 1С ошибка 502" → is_simple: false (сложная проблема)

Ответь ТОЛЬКО в формате JSON:
{
  "category": "...",
  "department": "...",
  "priority": "...",
  "is_simple": true/false
}`,
          },
          {
            role: 'user',
            content: `Классифицируй эту заявку: "${message}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let classification;
      
      try {
        // Пытаемся найти JSON в тексте, если он обёрнут в markdown код
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        classification = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        console.error('Содержимое ответа:', content);
        throw new Error('Не удалось распарсить JSON ответ');
      }

      return {
        category: classification.category || 'Общая поддержка',
        department: classification.department || 'Общий отдел',
        priority: classification.priority || 'Средний',
        is_simple: classification.is_simple === true || classification.is_simple === 'true' || classification.is_simple === true,
      };
    } catch (error) {
      console.error('❌ Ошибка классификации:', error);
      return {
        category: 'Общая поддержка',
        department: 'Общий отдел',
        priority: 'Средний',
        is_simple: false,
      };
    }
  }

  // Получение авторешения для типовой проблемы
  async getAutoSolution(message: string, category: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты ИИ-ассистент службы поддержки Казахтелеком. 
Пользователь обратился с типовой проблемой. Дай короткую пошаговую инструкцию для решения проблемы.

Формат ответа:
1. Шаг первый (краткое описание)
2. Шаг второй (краткое описание)
3. Шаг третий (краткое описание)
4. Дополнительный шаг (если нужен)

Каждый шаг должен быть кратким (одно-два предложения), понятным и конкретным.
Категория проблемы: ${category}`,
          },
          {
            role: 'user',
            content: `Проблема: "${message}". Дай короткую пошаговую инструкцию для решения.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 400,
      });

      const solution = completion.choices[0]?.message?.content || 'Инструкция будет предоставлена специалистом.';
      return solution;
    } catch (error) {
      console.error('Ошибка получения авторешения:', error);
      return 'Мы получили ваше обращение. Специалист свяжется с вами в ближайшее время.';
    }
  }

  // Создание summary для сложной проблемы
  async createSummary(message: string, classification: {
    category: string;
    department: string;
    priority: string;
  }): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Создай краткое резюме заявки для оператора (1-2 предложения). 
Укажи суть проблемы коротко и ясно. Формат: "Коротко: [описание проблемы]. [Дополнительная важная информация, если есть]."`,
          },
          {
            role: 'user',
            content: `Заявка: "${message}". Категория: ${classification.category}. Приоритет: ${classification.priority}.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const summary = completion.choices[0]?.message?.content || `Проблема: ${message}`;
      return summary;
    } catch (error) {
      console.error('Ошибка создания summary:', error);
      return `Коротко: ${message}. Категория: ${classification.category}. Приоритет: ${classification.priority}.`;
    }
  }

  // Создание черновика ответа для оператора
  async createDraftResponse(message: string, summary: string, department: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты помощник оператора службы поддержки Казахтелеком. 
Создай вежливый черновик ответа для пользователя.

Структура ответа:
1. Приветствие ("Здравствуйте!" или "Добрый день!")
2. Подтверждение получения обращения
3. Краткое объяснение ситуации (если возможно)
4. Указание что заявка передана в отдел "${department}"
5. Обещание помочь в ближайшее время
6. Вежливое завершение

Будь профессиональным, дружелюбным, но кратким (2-3 абзаца максимум).`,
          },
          {
            role: 'user',
            content: `Резюме проблемы: "${summary}". Оригинальное обращение: "${message}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 350,
      });

      const draft = completion.choices[0]?.message?.content || `Здравствуйте!

Мы получили ваше обращение и передали его специалистам отдела "${department}". Они помогут в ближайшее время.

С уважением,
Служба поддержки Казахтелеком`;
      
      return draft;
    } catch (error) {
      console.error('Ошибка создания черновика:', error);
      return `Здравствуйте!

Мы получили ваше обращение и передали его специалистам отдела "${department}". Они свяжутся с вами в ближайшее время.

С уважением,
Служба поддержки Казахтелеком`;
    }
  }
}
