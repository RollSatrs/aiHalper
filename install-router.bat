@echo off
echo Installing react-router-dom...
npm install react-router-dom
if %errorlevel% equ 0 (
    echo.
    echo SUCCESS! Package installed.
    echo Now restart the dev server with: npm run dev
) else (
    echo.
    echo ERROR! Installation failed.
    echo Please run manually: npm install react-router-dom
)
pause

