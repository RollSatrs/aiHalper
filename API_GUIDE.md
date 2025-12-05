# Руководство по API

## Эндпоинты

### 1. Создание заявки (тикета)
```
POST /api/tickets/create
Body: {
  "message": "Текст заявки пользователя"
}
```

**Ответ:**
```json
{
  "ticket": {
    "id": 1,
    "message": "...",
    "category": "Сеть / Wi-Fi",
    "department": "IT Support",
    "priority": "Средний",
    "is_simple": true,
    "status": "closed_auto",
    "autoSolved": true,
    "autoSolution": "Инструкция по решению...",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "resolvedAt": "2024-01-01T12:00:05.000Z"
  },
  "reply": "✅ Ваш запрос решён автоматически!...",
  "autoSolved": true
}
```

### 2. Получение всех тикетов
```
GET /api/tickets
```

### 3. Получение тикета по ID
```
GET /api/tickets/:id
```

### 4. Панель мониторинга (Dashboard)
```
GET /api/dashboard
```

**Ответ:**
```json
{
  "totalTickets": 320,
  "autoSolved": 168,
  "autoSolvedPercent": 52,
  "avgResponseTime": "14 сек",
  "classificationAccuracy": 0.93,
  "routingErrors": 4
}
```

### 5. Простой чат (старый эндпоинт, все еще работает)
```
POST /ai/ask
Body: {
  "message": "Вопрос пользователя"
}
```

## Как это работает

1. **Классификация**: Система автоматически определяет категорию, отдел, приоритет и является ли проблема типовой
2. **Авторешение**: Если проблема типовая (`is_simple: true`), система дает готовое решение и закрывает тикет
3. **Ручная обработка**: Если проблема сложная, создается summary и черновик ответа для оператора
4. **Мониторинг**: Dashboard показывает все метрики работы системы

