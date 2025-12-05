@echo off
chcp 65001 >nul
echo Удаление секрета из истории Git...
echo.

cd /d "%~dp0"

echo Шаг 1: Удаление файлов из истории...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch CREATE_ENV.ps1 SETUP.md" --prune-empty --tag-name-filter cat -- --all

if %errorlevel% neq 0 (
    echo Ошибка при выполнении filter-branch
    pause
    exit /b 1
)

echo.
echo Шаг 2: Очистка кеша Git...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Шаг 3: Force push...
echo ВНИМАНИЕ: Это перезапишет историю на GitHub!
echo.
pause

git push origin backend --force

echo.
echo Готово!
pause

