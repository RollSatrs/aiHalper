# Решение проблемы с DATABASE_URL

Drizzle не может подключиться к базе данных, так как в `.env` файле отсутствует `DATABASE_URL`.

## Быстрое решение

### 1. Откройте файл `.env` в папке `aihelper-backend`

### 2. Добавьте или обновите переменную `DATABASE_URL`:

**Готовый URL для вашей конфигурации:**
```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
```

**Где:**
- `postgres` - стандартный пользователь PostgreSQL
- `12345678` - ваш пароль
- `localhost:5432` - хост и порт (по умолчанию)
- `aiHelper` - название вашей базы данных

### Альтернативный формат (если нужно заменить значения):
```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### Другие примеры:
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aihelper
```

### Пример для Docker PostgreSQL:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/aihelper
```

## Если PostgreSQL еще не установлен

### Вариант 1: Установить PostgreSQL локально
1. Скачайте с https://www.postgresql.org/download/windows/
2. Установите и запомните пароль для пользователя `postgres`
3. Создайте базу данных:
   ```sql
   CREATE DATABASE "aiHelper";
   ```
   ⚠️ **Важно:** Обратите внимание на кавычки, так как в названии есть заглавная буква.

### Вариант 2: Использовать Docker
```bash
docker run --name postgres-aihelper -e POSTGRES_PASSWORD=password -e POSTGRES_DB=aihelper -p 5432:5432 -d postgres
```

После запуска используйте:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/aihelper
```

## После настройки DATABASE_URL

1. Сохраните `.env` файл
2. Примените миграции:
   ```bash
   cd aihelper-backend
   pnpm run db:push
   ```

## Полный пример `.env` файла

```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-proj-...your-key-here...
```

💡 **См. также:** `DATABASE_URL_EXAMPLE.md` для готового примера с вашими данными.

