# 🔧 Решение ошибки 401 при логине

## ❌ Ошибка:
```
POST http://localhost:3000/api/auth/login 401 (Unauthorized)
```

## 🔍 Причины:

Ошибка 401 означает что:
1. **Оператор не создан в базе данных** (самая частая причина)
2. **Неправильный email или пароль**
3. **База данных не подключена**

---

## ✅ Решение:

### Шаг 1: Создайте операторов в БД

**Запустите seed скрипт:**
```bash
cd aihelper-backend
pnpm run db:seed
```

Это создаст операторов:
- `admin@admin.com` / `admin123`
- `operator1@example.com` / `operator1`
- `operator2@example.com` / `operator2`

### Шаг 2: Используйте правильные учетные данные

**В форме логина введите:**
- **Email:** `admin@admin.com`
- **Пароль:** `admin123`

Или любые другие из созданных операторов.

---

## 🔍 Проверка что оператор создан:

### Вариант 1: Через SQL

```sql
-- Подключитесь к PostgreSQL
psql -U postgres -d aiHelper

-- Проверьте операторов
SELECT id, name, email, role FROM users WHERE role = 'operator';
```

Должны увидеть минимум одного оператора.

### Вариант 2: Через API (если оператор уже есть)

```javascript
// В консоли браузера (F12)
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@admin.com',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log('Результат:', data))
.catch(err => console.error('Ошибка:', err));
```

---

## 📋 Полный чеклист:

1. ✅ База данных PostgreSQL запущена
2. ✅ `.env` файл настроен (`DATABASE_URL`)
3. ✅ Бэкенд запущен (`pnpm run start:dev`)
4. ✅ **Операторы созданы** (`pnpm run db:seed`)
5. ✅ Используете правильные email/пароль

---

## 🚀 Быстрое решение:

```bash
# 1. Перейдите в папку бэкенда
cd aihelper-backend

# 2. Создайте операторов
pnpm run db:seed

# 3. Войдите используя:
# Email: admin@admin.com
# Пароль: admin123
```

---

## ⚠️ Если все равно не работает:

1. **Проверьте логи бэкенда** - там будут детали ошибки
2. **Проверьте подключение к БД** - должно быть сообщение "✅ Подключение к базе данных установлено"
3. **Убедитесь что используете правильный email** - проверьте регистр букв
4. **Убедитесь что используете правильный пароль** - пробелы в начале/конце?

---

## 💡 Альтернатива: Создать оператора через API

Если seed не работает, создайте оператора вручную:

```javascript
// В консоли браузера (F12)
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Администратор',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'operator'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Оператор создан!', data);
  console.log('Теперь войдите: admin@admin.com / admin123');
})
.catch(err => console.error('Ошибка:', err));
```

---

## ✅ После создания оператора:

1. Откройте: http://localhost:5173/admin
2. Введите: `admin@admin.com` / `admin123`
3. Должен произойти успешный вход! ✅

