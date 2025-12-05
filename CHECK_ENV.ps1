# Скрипт для проверки файла .env
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Проверка файла .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

# Проверка существования файла
if (-not (Test-Path $envPath)) {
    Write-Host "❌ ФАЙЛ .env НЕ НАЙДЕН!" -ForegroundColor Red
    Write-Host "📁 Путь: $envPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Создайте файл .env в папке aihelper-backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Файл .env найден" -ForegroundColor Green
Write-Host "📁 Путь: $envPath" -ForegroundColor Cyan
Write-Host ""

# Чтение содержимого файла
$content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue

if ($null -eq $content -or $content.Trim() -eq "") {
    Write-Host "❌ Файл .env ПУСТОЙ!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Файл должен содержать:" -ForegroundColor Yellow
    Write-Host "OPENAI_API_KEY=ваш_токен" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Содержимое файла:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host $content
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Проверка формата
$lines = $content -split "`n" | Where-Object { $_.Trim() -ne "" }
$hasApiKey = $false
$apiKeyValue = ""

foreach ($line in $lines) {
    $trimmedLine = $line.Trim()
    
    if ($trimmedLine -match '^OPENAI_API_KEY=(.+)$') {
        $hasApiKey = $true
        $apiKeyValue = $matches[1].Trim()
        Write-Host "✅ Найдена переменная OPENAI_API_KEY" -ForegroundColor Green
        
        # Проверка значения
        if ([string]::IsNullOrWhiteSpace($apiKeyValue)) {
            Write-Host "❌ Значение OPENAI_API_KEY ПУСТОЕ!" -ForegroundColor Red
            exit 1
        }
        
        if ($apiKeyValue.Length -lt 10) {
            Write-Host "⚠️  Значение OPENAI_API_KEY кажется слишком коротким" -ForegroundColor Yellow
        }
        
        Write-Host "   Длина токена: $($apiKeyValue.Length) символов" -ForegroundColor Cyan
        
        # Показываем первые и последние символы для проверки
        if ($apiKeyValue.Length -gt 20) {
            $preview = $apiKeyValue.Substring(0, 10) + "..." + $apiKeyValue.Substring($apiKeyValue.Length - 10)
            Write-Host "   Превью: $preview" -ForegroundColor Gray
        }
        
        # Проверка формата (должен начинаться с sk-)
        if ($apiKeyValue -notmatch '^sk-') {
            Write-Host "⚠️  Внимание: токен обычно начинается с 'sk-'" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Формат токена выглядит правильно (начинается с 'sk-')" -ForegroundColor Green
        }
    }
    
    # Проверка на лишние пробелы
    if ($trimmedLine -match 'OPENAI_API_KEY\s*=\s*\s') {
        Write-Host "⚠️  Обнаружены лишние пробелы вокруг знака '='" -ForegroundColor Yellow
    }
    
    # Проверка на кавычки
    if ($trimmedLine -match 'OPENAI_API_KEY\s*=\s*["'']') {
        Write-Host "⚠️  Внимание: обнаружены кавычки в значении" -ForegroundColor Yellow
        Write-Host "   Убедитесь, что значение не заключено в кавычки" -ForegroundColor Yellow
    }
}

if (-not $hasApiKey) {
    Write-Host "❌ Переменная OPENAI_API_KEY НЕ НАЙДЕНА в файле!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Файл должен содержать строку:" -ForegroundColor Yellow
    Write-Host "OPENAI_API_KEY=ваш_токен" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ ПРОВЕРКА ЗАВЕРШЕНА" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Если все проверки пройдены, но бэкенд всё равно" -ForegroundColor Yellow
Write-Host "не видит переменную, попробуйте:" -ForegroundColor Yellow
Write-Host "1. Перезапустить бэкенд (остановить и запустить заново)" -ForegroundColor Cyan
Write-Host "2. Проверить, что файл находится в правильной папке" -ForegroundColor Cyan
Write-Host ""

