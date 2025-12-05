# 📊 Структура базы данных

## ✅ Полная схема для всего workflow

База данных состоит из **3 таблиц**, которые покрывают весь процесс работы сервиса.

---

## 1️⃣ Таблица `users` (Пользователи)

**Назначение:** Хранение клиентов и операторов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | serial (PK) | Уникальный ID пользователя |
| `name` | varchar(255) | Имя пользователя |
| `email` | varchar(255) UNIQUE | Email (логин) |
| `password` | varchar(255) | Хешированный пароль (bcrypt) |
| `role` | enum | Роль: `'client'` или `'operator'` |
| `created_at` | timestamp | Дата создания |
| `updated_at` | timestamp | Дата обновления |

**Пример данных:**
```sql
INSERT INTO users (name, email, password, role) 
VALUES 
  ('Администратор', 'admin@admin.com', '<хеш>', 'operator'),
  ('Иван Иванов', 'ivan@example.com', '<хеш>', 'client');
```

---

## 2️⃣ Таблица `tickets` (Тикеты/Заявки)

**Назначение:** Хранение всех заявок с полной информацией

### Базовая информация:
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | serial (PK) | Уникальный ID тикета |
| `user_id` | integer (FK) | ID пользователя (может быть NULL для анонимных) |
| `message` | text | Текст заявки от пользователя |

### Классификация (от ИИ):
| Поле | Тип | Описание |
|------|-----|----------|
| `category` | varchar(255) | Категория (например: "Сеть / Wi-Fi", "1С") |
| `department` | varchar(255) | Отдел (например: "IT Support", "1С Development") |
| `priority` | varchar(50) | Приоритет ("Низкий", "Средний", "Высокий") |
| `is_simple` | boolean | Типовая ли проблема (true = авторешение) |

### Статус и обработка:
| Поле | Тип | Описание |
|------|-----|----------|
| `status` | enum | Статус: `'new'`, `'in-progress'`, `'closed_auto'`, `'resolved'` |
| `auto_solved` | boolean | Был ли решен автоматически |

### Для простых тикетов (авторешение):
| Поле | Тип | Описание |
|------|-----|----------|
| `auto_solution` | text | Инструкция от ИИ для решения |
| `response_time` | integer | Время ответа в секундах |

### Для сложных тикетов (оператор):
| Поле | Тип | Описание |
|------|-----|----------|
| `summary` | text | Краткое резюме от ИИ для оператора |
| `draft_response` | text | Черновик ответа от ИИ (можно редактировать) |

### Метрики (для Dashboard):
| Поле | Тип | Описание |
|------|-----|----------|
| `classification_correct` | boolean | Правильность классификации ИИ |
| `routing_error` | boolean | Ошибка маршрутизации в отдел |

### Временные метки:
| Поле | Тип | Описание |
|------|-----|----------|
| `created_at` | timestamp | Дата создания тикета |
| `resolved_at` | timestamp | Дата решения (закрытия) |

**Пример записи (простая проблема):**
```sql
INSERT INTO tickets (
  user_id, message, category, department, priority, is_simple,
  status, auto_solved, auto_solution, response_time, created_at, resolved_at
) VALUES (
  1, 
  'Не могу подключиться к Wi-Fi',
  'Сеть / Wi-Fi',
  'IT Support',
  'Средний',
  true,  -- простая проблема
  'closed_auto',  -- закрыт автоматически
  true,
  '1. Откройте настройки Wi-Fi\n2. Выберите CORP-WIFI\n3. Введите пароль',
  14,  -- секунд
  NOW(),
  NOW()
);
```

**Пример записи (сложная проблема):**
```sql
INSERT INTO tickets (
  user_id, message, category, department, priority, is_simple,
  status, auto_solved, summary, draft_response, created_at
) VALUES (
  1,
  'После обновления сервера 1С ошибка 502',
  '1С',
  '1С Development',
  'Высокий',
  false,  -- сложная проблема
  'in-progress',  -- в работе
  false,
  'Коротко: после обновления сервера 1С не проводится документ, ошибка 502',
  'Здравствуйте! Мы получили ваше обращение. Ошибка 502 может возникать...',
  NOW()
);
```

---

## 3️⃣ Таблица `messages` (История сообщений)

**Назначение:** Хранение истории всех вопросов и ответов в чате

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | serial (PK) | Уникальный ID сообщения |
| `user_id` | integer (FK) | ID пользователя (может быть NULL) |
| `ticket_id` | integer (FK) | ID тикета (может быть NULL для простых вопросов) |
| `message` | text | Текст вопроса пользователя |
| `reply` | text | Ответ (от ИИ или оператора) |
| `is_question` | boolean | true = вопрос, false = ответ |
| `is_ticket_created` | boolean | Был ли создан тикет для этого сообщения |
| `created_at` | timestamp | Дата создания |

**Пример записи:**
```sql
INSERT INTO messages (user_id, ticket_id, message, reply, is_question, is_ticket_created) 
VALUES (
  1,  -- user_id
  5,  -- ticket_id (если создан тикет)
  'Не могу подключиться к Wi-Fi',
  '✅ Ваш запрос решён автоматически! 👌\n\n📋 Инструкция...',
  true,  -- это вопрос
  true   -- был создан тикет
);
```

---

## 🔄 Как данные сохраняются по workflow:

### Шаг 1: Пользователь отправляет заявку
```
POST /api/tickets/create
{
  "message": "Не могу подключиться к Wi-Fi"
}
```

### Шаг 2: ИИ классифицирует
```javascript
{
  category: "Сеть / Wi-Fi",
  department: "IT Support",
  priority: "Средний",
  is_simple: true
}
```

### Шаг 3-4: Если простая → авторешение
```sql
INSERT INTO tickets VALUES (
  ...,
  is_simple = true,
  status = 'closed_auto',
  auto_solved = true,
  auto_solution = 'Инструкция от ИИ...',
  response_time = 14
);

INSERT INTO messages VALUES (
  user_id, ticket_id, message, reply='✅ Ваш запрос решён...', ...
);
```

### Шаг 5: Если сложная → оператор
```sql
INSERT INTO tickets VALUES (
  ...,
  is_simple = false,
  status = 'in-progress',
  auto_solved = false,
  summary = 'Коротко: после обновления...',
  draft_response = 'Здравствуйте! Мы получили...'
);
```

### Шаг 6: Dashboard (метрики)
```sql
-- Все метрики вычисляются из таблицы tickets:
SELECT 
  COUNT(*) as totalTickets,
  COUNT(*) FILTER (WHERE auto_solved = true) as autoSolved,
  AVG(response_time) as avgResponseTime,
  COUNT(*) FILTER (WHERE classification_correct = false) as routingErrors
FROM tickets;
```

---

## 📋 Связи между таблицами:

```
users (1) ──────< (много) tickets
                       │
                       │ (1 к 1)
                       │
                       v
                   (много) messages
```

- Один пользователь может иметь много тикетов
- Один тикет может иметь много сообщений
- Сообщение может быть без тикета (простой вопрос без создания тикета)

---

## ✅ Итог:

**Все данные из workflow сохраняются в БД:**
- ✅ Классификация ИИ → `category`, `department`, `priority`, `is_simple`
- ✅ Авторешение → `auto_solution`, `response_time`, `status = 'closed_auto'`
- ✅ Сложные тикеты → `summary`, `draft_response`, `status = 'in-progress'`
- ✅ Метрики → `auto_solved`, `classification_correct`, `routing_error`
- ✅ История → таблица `messages`
- ✅ Пользователи → таблица `users`

**База данных полностью готова для всего workflow!** 🎉

