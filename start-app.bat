@echo off
REM Start the development server and open browser

echo Starting Art Web application...
echo.

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Start the dev server in background
echo Starting dev server on localhost:5173...
start cmd /k "npm run dev:full"

REM Wait for server to start
timeout /t 5 /nobreak

REM Open browser to localhost
echo Opening application in browser...
start http://localhost:5173

echo.
echo Application started! Opening in your browser...
