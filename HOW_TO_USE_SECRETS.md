# 🔐 Как правильно хранить секреты в GitHub

## ❌ НЕПРАВИЛЬНО:
- ❌ Коммитить `.env` с реальными ключами
- ❌ Хранить ключи в коде
- ❌ Пушить секреты в Git

## ✅ ПРАВИЛЬНО:

### 1️⃣ **Локальная разработка - используйте `.env`**

#### Создайте файл `.env` (НЕ коммитьте его!):
```bash
# aihelper-backend/.env
OPENAI_API_KEY=sk-proj-ваш-настоящий-ключ-здесь
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/aiHelper
```

✅ Файл `.env` уже в `.gitignore` - он НЕ попадет в Git!

#### Создайте `.env.example` (ШАБЛОН БЕЗ секретов):
```bash
# aihelper-backend/.env.example
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/aiHelper
```

✅ `.env.example` можно коммитить - там только шаблоны!

---

### 2️⃣ **GitHub Secrets (для CI/CD и деплоя)**

#### Как добавить секрет в GitHub:

1. **Перейдите в репозиторий:**
   ```
   https://github.com/RollSatrs/aiHalper
   ```

2. **Откройте Settings:**
   - Нажмите **Settings** (вверху справа)
   - В левом меню: **Secrets and variables** → **Actions**

3. **Добавьте новый секрет:**
   - Нажмите **New repository secret**
   - **Name**: `OPENAI_API_KEY`
   - **Value**: ваш настоящий API ключ
   - Нажмите **Add secret**

4. **Повторите для других секретов:**
   - `DATABASE_URL`
   - `JWT_SECRET`

#### Использование в GitHub Actions:
```yaml
# .github/workflows/deploy.yml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

### 3️⃣ **На сервере (при деплое)**

#### Вариант A: Environment Variables
```bash
export OPENAI_API_KEY=sk-proj-...
export DATABASE_URL=postgresql://...
```

#### Вариант B: Docker
```yaml
# docker-compose.yml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - DATABASE_URL=${DATABASE_URL}
```

---

## 🚨 ЧТО ДЕЛАТЬ, ЕСЛИ СЕКРЕТ УЖЕ ПОПАЛ В GIT:

### Шаг 1: Отзовите ключ
1. Зайдите: https://platform.openai.com/api-keys
2. Найдите старый ключ
3. Нажмите **Revoke** (Отозвать)

### Шаг 2: Создайте новый ключ
1. Создайте новый ключ в OpenAI
2. Обновите `.env` файл

### Шаг 3: Удалите из истории Git
```bash
# В папке aihelper-backend
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch CREATE_ENV.ps1 SETUP.md" --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin backend --force
```

---

## ✅ ЧЕКЛИСТ:

- [ ] `.env` файл создан (НЕ в Git!)
- [ ] `.env.example` создан (можно коммитить)
- [ ] `.gitignore` содержит `.env` ✅ (уже настроено)
- [ ] Старые ключи отозваны
- [ ] Новые ключи созданы
- [ ] GitHub Secrets настроены (для CI/CD)
- [ ] Секреты удалены из истории Git

---

## 📋 СТРУКТУРА ФАЙЛОВ:

```
aihelper-backend/
├── .env              ❌ НЕ коммитить (в .gitignore)
├── .env.example      ✅ Коммитить (шаблон)
├── .gitignore        ✅ Коммитить (защита)
└── src/
```

---

## 🎯 ИТОГ:

**Локально:** Используйте `.env` файл (не коммитьте!)  
**GitHub:** Используйте GitHub Secrets (Settings → Secrets)  
**Сервер:** Используйте переменные окружения  

**Никогда не коммитьте реальные секреты!** 🔒

