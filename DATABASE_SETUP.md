# Настройка базы данных PostgreSQL

## 1. Установка PostgreSQL

Если PostgreSQL еще не установлен, установите его:
- Windows: https://www.postgresql.org/download/windows/
- Или используйте Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

## 2. Создание базы данных

Подключитесь к PostgreSQL и создайте базу данных:

```sql
CREATE DATABASE "aiHelper";
```

⚠️ **Важно:** Обратите внимание на кавычки, так как в названии есть заглавная буква `H`.

## 3. Настройка переменных окружения

**ВАЖНО:** Создайте или откройте файл `.env` в папке `aihelper-backend` и добавьте:

```
DATABASE_URL=postgresql://username:password@localhost:5432/aihelper
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your_openai_api_key
```

**Где:**
- `username` - имя пользователя PostgreSQL (обычно `postgres`)
- `password` - пароль PostgreSQL
- `localhost:5432` - хост и порт (по умолчанию 5432)
- `aihelper` - имя базы данных

**Пример для вашей конфигурации (пароль: 12345678, БД: aiHelper):**
```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
```

**Другие примеры:**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aihelper
```

**Пример для Docker:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/aihelper
```

⚠️ **Убедитесь, что файл `.env` существует и содержит `DATABASE_URL`, иначе Drizzle не сможет подключиться к БД!**

## 4. Создание миграций

Выполните команды для создания и применения миграций:

```bash
# Сгенерировать миграции
pnpm run db:generate

# Применить миграции к базе данных
pnpm run db:push
```

Или используйте:

```bash
# Открыть Drizzle Studio для визуального управления БД
pnpm run db:studio
```

## 5. Готово!

После настройки БД запустите бэкенд:

```bash
pnpm run start:dev
```

