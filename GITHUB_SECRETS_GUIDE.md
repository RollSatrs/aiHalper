# 🔐 Правильное хранение секретов в GitHub

## ❌ ЧТО НЕЛЬЗЯ ДЕЛАТЬ:

- ❌ Коммитить `.env` файлы в Git
- ❌ Коммитить файлы с API ключами
- ❌ Хранить секреты в коде
- ❌ Пушить секреты в публичный репозиторий

---

## ✅ ПРАВИЛЬНЫЕ СПОСОБЫ:

### 1. **Использовать `.env` файлы (для локальной разработки)**

#### Шаг 1: Создайте `.env` файл
```bash
# aihelper-backend/.env
OPENAI_API_KEY=sk-proj-ваш-ключ-здесь
DATABASE_URL=postgresql://user:password@localhost:5432/aiHelper
```

#### Шаг 2: Убедитесь, что `.env` в `.gitignore`
Файл `.gitignore` уже настроен:
```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

#### Шаг 3: Создайте `.env.example` (шаблон БЕЗ секретов)
```bash
# aihelper-backend/.env.example
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/aiHelper
```

---

### 2. **GitHub Secrets (для CI/CD и деплоя)**

#### Как добавить секрет в GitHub:

1. Перейдите в ваш репозиторий на GitHub
2. Откройте: **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Введите:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: ваш API ключ
5. Нажмите **Add secret**

#### Использование в GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup environment
        run: |
          echo "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}" >> .env
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
```

---

### 3. **Environment Variables на сервере**

При деплое на сервер (VPS, Heroku, etc.):

#### Вариант A: Environment Variables
```bash
export OPENAI_API_KEY=sk-proj-...
export DATABASE_URL=postgresql://...
```

#### Вариант B: Docker Secrets
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
```

---

## 🛠️ ЧТО ДЕЛАТЬ С УЖЕ ПОПАВШИМИ СЕКРЕТАМИ:

### Шаг 1: Отзовите скомпрометированный ключ

1. Зайдите в OpenAI Dashboard: https://platform.openai.com/api-keys
2. Найдите старый ключ
3. Нажмите **Revoke** (Отозвать)

### Шаг 2: Создайте новый ключ

1. В OpenAI Dashboard нажмите **Create new secret key**
2. Скопируйте новый ключ
3. Обновите `.env` файл

### Шаг 3: Удалите секрет из истории Git

```bash
# Удаляем файлы с секретами из истории
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch CREATE_ENV.ps1 SETUP.md" --prune-empty --tag-name-filter cat -- --all

# Очищаем кеш
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin backend --force
```

---

## 📋 ЧЕКЛИСТ БЕЗОПАСНОСТИ:

- ✅ `.env` в `.gitignore`
- ✅ `.env.example` создан (БЕЗ секретов)
- ✅ Старые ключи отозваны
- ✅ Секреты удалены из истории Git
- ✅ GitHub Secrets настроены (для CI/CD)
- ✅ Секреты НЕ в коде
- ✅ Секреты НЕ в коммитах

---

## 🎯 РЕКОМЕНДАЦИИ:

1. **Всегда** используйте `.env` файлы для локальной разработки
2. **Никогда** не коммитьте `.env` файлы
3. **Всегда** добавляйте новые секреты в `.gitignore`
4. **Отзывайте** ключи, если они попали в Git
5. **Используйте** GitHub Secrets для CI/CD
6. **Используйте** переменные окружения на сервере

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ:

- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Git Ignore: https://git-scm.com/docs/gitignore
- OpenAI API Keys: https://platform.openai.com/api-keys

