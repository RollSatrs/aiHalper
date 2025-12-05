# 🔌 API для интеграций

## Единый интеллектуальный вход для всех обращений

Реализованы endpoints для приема заявок из разных источников.

---

## 📧 Email интеграция

**Endpoint:** `POST /api/integrations/email`

**Request:**
```json
{
  "from": "user@example.com",
  "subject": "Не могу подключиться к Wi-Fi",
  "text": "Полный текст письма",
  "html": "<html>...</html>"
}
```

**Использование:**
- Настройте email сервер для пересылки писем на этот endpoint
- Или используйте email-парсер (например, Mailgun, SendGrid webhooks)

---

## 💬 Чат интеграция (Telegram, WhatsApp)

**Endpoint:** `POST /api/integrations/chat`

**Request:**
```json
{
  "platform": "telegram",
  "chatId": "123456789",
  "userId": "user123",
  "username": "@username",
  "message": "Не могу подключиться к Wi-Fi"
}
```

**Использование:**
- Создайте бота для Telegram/WhatsApp
- Настройте webhook на этот endpoint
- Бот пересылает сообщения пользователей

---

## 📞 Телефония интеграция

**Endpoint:** `POST /api/integrations/phone`

**Request:**
```json
{
  "phoneNumber": "+77001234567",
  "transcription": "Транскрипция разговора",
  "message": "Пользователь сказал: не могу подключиться к Wi-Fi"
}
```

**Использование:**
- Настройте IVR систему для отправки транскрипций
- Или используйте сервисы распознавания речи (например, Twilio)

---

## 🌐 Портал интеграция

**Endpoint:** `POST /api/integrations/portal`

**Request:**
```json
{
  "message": "Не могу подключиться к Wi-Fi",
  "portalName": "Корпоративный портал",
  "portalUserId": "user123"
}
```

**Использование:**
- Интегрируйте с внешним порталом/сайтом
- Используйте этот endpoint для создания заявок

---

## 🔄 Универсальный endpoint

**Endpoint:** `POST /api/integrations/create`

**Request:**
```json
{
  "message": "Не могу подключиться к Wi-Fi"
}
```

**Headers:**
```
x-source: email|telegram|whatsapp|phone|portal
x-user-email: user@example.com (опционально)
```

**Query параметры:**
```
?source=email
```

---

## ✅ Все заявки обрабатываются одинаково:

1. Автоматическая классификация через ИИ
2. Автоматическое определение типа проблемы
3. Авторешение для типовых проблем
4. Маршрутизация в отделы для сложных

**Независимо от источника заявки!** 🎯

---

## 📝 Примеры использования:

### Email через webhook:
```bash
curl -X POST http://localhost:3000/api/integrations/email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "user@example.com",
    "subject": "Проблема с Wi-Fi",
    "text": "Не могу подключиться"
  }'
```

### Telegram бот:
```javascript
// В коде Telegram бота
bot.on('message', async (msg) => {
  await fetch('http://localhost:3000/api/integrations/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: 'telegram',
      chatId: msg.chat.id,
      userId: msg.from.id,
      username: msg.from.username,
      message: msg.text
    })
  });
});
```

---

## 🎯 Итог:

**Единый вход реализован!** Все заявки, независимо от источника, проходят через одинаковую обработку с использованием ИИ. ✅

