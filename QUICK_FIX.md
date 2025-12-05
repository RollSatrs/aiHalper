# 🚀 БЫСТРОЕ РЕШЕНИЕ

## Вариант 1: Запустить скрипт (Windows)

**Просто запустите:**
```
fix-git-secret.bat
```

---

## Вариант 2: Выполнить команды вручную

**В PowerShell в папке `aihelper-backend`:**

```powershell
# 1. Удалить файлы из истории
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch CREATE_ENV.ps1 SETUP.md" --prune-empty --tag-name-filter cat -- --all

# 2. Очистить кеш
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Force push
git push origin backend --force
```

---

## Вариант 3: Использовать GitHub Allow URL (быстро)

1. **Перейдите:** https://github.com/RollSatrs/aiHalper/security/secret-scanning/unblock-secret/36QlEHTa3pImUpTQqKLpKuWOofF
2. **Нажмите:** "Allow secret"
3. **Затем:** `git push origin backend`

⚠️ **ВАЖНО:** Отзовите старый ключ и создайте новый!

---

## После исправления:

1. Отзовите старый OpenAI API ключ
2. Создайте новый ключ
3. Обновите `.env` файл
