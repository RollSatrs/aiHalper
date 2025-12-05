# Диагностический скрипт для проверки проблем с запуском бэкенда
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Диагностика проблем с запуском бэкенда" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()

# 1. Проверка наличия node_modules
Write-Host "1. Проверка зависимостей..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    $errors += "❌ Папка node_modules не найдена. Запустите: pnpm install"
    Write-Host "❌ Папка node_modules не найдена" -ForegroundColor Red
} else {
    Write-Host "✅ Папка node_modules найдена" -ForegroundColor Green
}
Write-Host ""

# 2. Проверка файла .env
Write-Host "2. Проверка файла .env..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    $errors += "❌ Файл .env не найден. Создайте его командой: .\CREATE_ENV.ps1"
    Write-Host "❌ Файл .env не найден" -ForegroundColor Red
} else {
    Write-Host "✅ Файл .env найден" -ForegroundColor Green
    
    $content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content -or $content.Trim() -eq "") {
        $errors += "❌ Файл .env пустой"
        Write-Host "❌ Файл .env пустой" -ForegroundColor Red
    } else {
        if ($content -match 'OPENAI_API_KEY=') {
            Write-Host "✅ Переменная OPENAI_API_KEY найдена" -ForegroundColor Green
        } else {
            $errors += "❌ Переменная OPENAI_API_KEY не найдена в файле .env"
            Write-Host "❌ Переменная OPENAI_API_KEY не найдена" -ForegroundColor Red
        }
    }
}
Write-Host ""

# 3. Проверка установки pnpm
Write-Host "3. Проверка pnpm..." -ForegroundColor Yellow
$pnpmVersion = & pnpm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ pnpm установлен: версия $pnpmVersion" -ForegroundColor Green
} else {
    $errors += "❌ pnpm не установлен или не найден в PATH"
    Write-Host "❌ pnpm не найден" -ForegroundColor Red
}
Write-Host ""

# 4. Проверка установки Node.js
Write-Host "4. Проверка Node.js..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js установлен: версия $nodeVersion" -ForegroundColor Green
} else {
    $errors += "❌ Node.js не установлен или не найден в PATH"
    Write-Host "❌ Node.js не найден" -ForegroundColor Red
}
Write-Host ""

# 5. Проверка ключевых пакетов
Write-Host "5. Проверка ключевых пакетов..." -ForegroundColor Yellow
$requiredPackages = @(
    "@nestjs/core",
    "@nestjs/config",
    "openai"
)

foreach ($package in $requiredPackages) {
    $packagePath = Join-Path "node_modules" $package
    if (Test-Path $packagePath) {
        Write-Host "✅ $package установлен" -ForegroundColor Green
    } else {
        $errors += "❌ Пакет $package не установлен. Запустите: pnpm install"
        Write-Host "❌ $package не найден" -ForegroundColor Red
    }
}
Write-Host ""

# 6. Проверка порта 3000
Write-Host "6. Проверка порта 3000..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Порт 3000 уже занят. Возможно, бэкенд уже запущен?" -ForegroundColor Yellow
    Write-Host "   Попробуйте остановить процесс или использовать другой порт" -ForegroundColor Yellow
} else {
    Write-Host "✅ Порт 3000 свободен" -ForegroundColor Green
}
Write-Host ""

# 7. Проверка структуры проекта
Write-Host "7. Проверка структуры проекта..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "src/main.ts",
    "src/app.module.ts",
    "src/ai/ai.service.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file найден" -ForegroundColor Green
    } else {
        $errors += "❌ Файл $file не найден"
        Write-Host "❌ $file не найден" -ForegroundColor Red
    }
}
Write-Host ""

# Итоги
Write-Host "========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "✅ Все проверки пройдены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Попробуйте запустить бэкенд:" -ForegroundColor Yellow
    Write-Host "  pnpm run start:dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Если бэкенд все равно не запускается, проверьте:" -ForegroundColor Yellow
    Write-Host "1. Откройте терминал в папке aihelper-backend" -ForegroundColor Cyan
    Write-Host "2. Запустите: pnpm run start:dev" -ForegroundColor Cyan
    Write-Host "3. Скопируйте полный текст ошибки и отправьте" -ForegroundColor Cyan
} else {
    Write-Host "❌ Найдены проблемы:" -ForegroundColor Red
    Write-Host ""
    foreach ($error in $errors) {
        Write-Host $error -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Исправьте ошибки выше и запустите скрипт снова." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan

