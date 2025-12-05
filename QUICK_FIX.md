# 🚨 Быстрое решение проблем

## Проблема 1: GitHub блокирует push (секрет в истории)

**Решение:** Отзовите и замените OpenAI API ключ

1. Откройте https://platform.openai.com/api-keys
2. Удалите старый ключ (который попал в Git)
3. Создайте новый ключ
4. Обновите `.env` файл с новым ключом
5. Попробуйте снова: `git push origin backend`

Подробнее: см. `FIX_GITHUB_SECRET.md`

---

## Проблема 2: Ошибка "Please provide required params for Postgres driver: url: ''"

**Решение:** Добавьте `DATABASE_URL` в `.env` файл

1. Откройте файл `aihelper-backend/.env`
2. Добавьте строку (или обновите существующую):
   ```
   DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
   ```
   ⚠️ **Убедитесь, что база данных `aiHelper` создана в PostgreSQL!**
4. Если PostgreSQL еще не установлен, установите его или используйте Docker

Подробнее: см. `FIX_DATABASE_URL.md` и `DATABASE_SETUP.md`

---

## ✅ Минимальный `.env` файл должен содержать:

```
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-proj-...your-new-key-here...
```

После настройки:
```bash
pnpm run db:push  # Применить миграции
pnpm run start:dev  # Запустить бэкенд
```

