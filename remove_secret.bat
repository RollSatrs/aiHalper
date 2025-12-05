@echo off
chcp 65001 >nul
echo ========================================
echo УДАЛЕНИЕ СЕКРЕТА ИЗ ИСТОРИИ GIT
echo ========================================
echo.

cd /d "%~dp0"

echo Шаг 1: Показываю последние 10 коммитов...
echo.
git log --oneline -10
echo.
echo ========================================
echo.

echo Напишите, какой по счету сверху коммит fc90df5?
echo (Например, если он третий сверху - введите 3)
set /p count="Введите число: "

echo.
echo Начинаю интерактивный rebase...
echo.
echo В открывшемся редакторе:
echo 1. Найдите строку с fc90df5
echo 2. Замените "pick" на "drop" в начале строки
echo 3. Сохраните и закройте редактор
echo.
pause

git rebase -i HEAD~%count%

echo.
echo ========================================
echo Rebase завершен!
echo.
echo Теперь нужно выполнить принудительный push:
echo git push origin backend --force
echo.
pause


