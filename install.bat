@echo off
chcp 65001 >nul
echo Удаление поврежденных зависимостей...
if exist node_modules\vite rmdir /s /q node_modules\vite
echo.
echo Установка всех зависимостей...
call npm install
echo.
if %errorlevel% equ 0 (
    echo Установка завершена успешно!
) else (
    echo Ошибка при установке. Попробуйте удалить папку node_modules и запустить снова.
)
pause

