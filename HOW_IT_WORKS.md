# 📋 Как работает система авторизации

## ✅ Что уже реализовано:

### 1. **Предзаполнение БД (Seed):**
- Скрипт `src/db/seed.ts` создает операторов через **INSERT** в таблицу `users`
- Пароли хешируются через bcrypt
- Данные сохраняются в PostgreSQL

### 2. **Логин:**
- Метод `login()` в `auth.service.ts` делает **SELECT** из таблицы `users`
- Проверяет email и пароль
- Возвращает JWT токен

---

## 🔄 Полный процесс:

### Шаг 1: Создание операторов (один раз)

```bash
cd aihelper-backend
pnpm run db:seed
```

**Что происходит:**
```sql
-- Проверка существования
SELECT * FROM users WHERE email = 'admin@admin.com';

-- Если не существует - создание
INSERT INTO users (name, email, password, role) 
VALUES ('Администратор', 'admin@admin.com', '<хеш_пароля>', 'operator');
```

### Шаг 2: Логин (при каждом входе)

**Frontend отправляет:**
```javascript
POST /api/auth/login
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Backend делает:**
```sql
-- SELECT из БД
SELECT * FROM users WHERE email = 'admin@admin.com' LIMIT 1;
```

**Проверка пароля:**
```typescript
bcrypt.compare(password, user.password) // Сравнение хеша
```

**Если всё ОК:**
- Генерируется JWT токен
- Возвращается токен и данные пользователя

---

## 📊 Схема работы:

```
1. Запуск seed скрипта
   ↓
2. INSERT операторов в БД (users таблица)
   ↓
3. Пользователь вводит логин/пароль на фронте
   ↓
4. POST /api/auth/login
   ↓
5. SELECT из users WHERE email = ...
   ↓
6. Проверка пароля через bcrypt.compare
   ↓
7. Генерация JWT токена
   ↓
8. Возврат токена клиенту
   ↓
9. Сохранение токена в localStorage
   ↓
10. Доступ к админ-панели ✅
```

---

## 🎯 Готовые данные операторов:

После запуска `pnpm run db:seed` создаются:

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@admin.com` | `admin123` | operator |
| `operator1@example.com` | `operator1` | operator |
| `operator2@example.com` | `operator2` | operator |

---

## ✅ Проверка что всё работает:

1. **Запустите seed:**
   ```bash
   pnpm run db:seed
   ```

2. **Проверьте БД:**
   ```sql
   SELECT id, name, email, role FROM users;
   ```
   Должны увидеть 3 операторов.

3. **Попробуйте войти:**
   - Откройте: http://localhost:5173/admin
   - Введите: `admin@admin.com` / `admin123`
   - Должен произойти успешный логин!

---

## 🔍 Где находится код:

- **Seed (INSERT):** `src/db/seed.ts` - строки 39-84
- **Login (SELECT):** `src/auth/auth.service.ts` - строки 67-71
- **Проверка пароля:** `src/auth/auth.service.ts` - строка 78

Всё уже готово и работает! ✅

