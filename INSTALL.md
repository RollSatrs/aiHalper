# Установка зависимостей

## Исправление политики выполнения PowerShell (для pnpm)

Если вы получаете ошибку `PSSecurityException` при запуске `pnpm`, выполните эту команду в PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Эта команда разрешит выполнение локальных скриптов для вашего пользователя.

---

Из-за проблемы с кодировкой PowerShell (кириллица в пути пользователя), выполните установку вручную:

## Способ 1: Через CMD (Command Prompt)

1. Откройте **Command Prompt (CMD)**:
   - Нажмите `Win + R`
   - Введите `cmd` и нажмите Enter

2. Перейдите в папку проекта:
   ```
   cd C:\Users\Владос\Desktop\aihelper-front
   ```

3. Установите зависимости:
   ```
   npm install
   ```

   Или только react-router-dom:
   ```
   npm install react-router-dom
   ```

## Способ 2: Через файловый менеджер

1. Откройте папку проекта в проводнике
2. В адресной строке введите `cmd` и нажмите Enter
3. Выполните `npm install`

## После установки

Запустите проект:
```
npm run dev
```

