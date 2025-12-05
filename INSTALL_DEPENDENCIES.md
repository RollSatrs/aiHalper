# Установка зависимостей для аутентификации и БД

Перед запуском бэкенда необходимо установить новые зависимости:

```bash
cd aihelper-backend
pnpm install
```

Это установит:
- `@nestjs/jwt` - для JWT токенов
- `@nestjs/passport` - для аутентификации
- `passport` и `passport-jwt` - стратегии аутентификации
- `bcrypt` - для хеширования паролей
- Типы для всех этих пакетов

После установки:
1. Настройте PostgreSQL (см. DATABASE_SETUP.md)
2. Создайте `.env` файл с переменными:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/aihelper
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   OPENAI_API_KEY=your_openai_api_key
   ```
3. Выполните миграции:
   ```bash
   pnpm run db:push
   ```
4. Запустите бэкенд:
   ```bash
   pnpm run start:dev
   ```

