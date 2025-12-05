# Пример DATABASE_URL для вашей конфигурации

## ✅ Готовый URL подключения к PostgreSQL:

```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
```

## 📋 Где:
- **username**: `postgres` (стандартный пользователь PostgreSQL)
- **password**: `12345678` (ваш пароль)
- **host**: `localhost` (локальный сервер)
- **port**: `5432` (стандартный порт PostgreSQL)
- **database**: `aiHelper` (имя вашей базы данных)

## 🔧 Как использовать:

### 1. Добавьте в файл `.env`:

Откройте файл `aihelper-backend/.env` и добавьте строку:

```env
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
```

### 2. Убедитесь, что база данных существует:

Подключитесь к PostgreSQL и выполните:

```sql
CREATE DATABASE "aiHelper";
```

⚠️ **Важно:** Обратите внимание на кавычки вокруг `aiHelper`, так как в названии есть заглавная буква.

### 3. Полный пример `.env` файла:

```env
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your_openai_api_key
```

### 4. Применить миграции:

После настройки `.env` файла выполните:

```bash
cd aihelper-backend
pnpm run db:push
```

## 💡 Примечание:

Если вы используете другое имя базы данных (например, `aihelper` с маленькой буквы), URL будет:

```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aihelper
```

Но так как вы указали `aiHelper` (с заглавной H), используйте именно этот вариант.

