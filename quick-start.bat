@echo off
echo ============================================================
echo StoryWritingProject - QUICK START
echo ============================================================
echo.
echo Stopping old services...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo.

echo Starting services (building in background)...
echo.

echo [1/5] Eureka Server (8761)
start "Eureka-8761" /min cmd /c "cd /d "%~dp0microservices\eureka-server" && mvn spring-boot:run -q"

timeout /t 25 /nobreak >nul

echo [2/5] User Service (8081)
start "User-8081" /min cmd /c "cd /d "%~dp0microservices\user-service" && mvn spring-boot:run -q"

timeout /t 15 /nobreak >nul

echo [3/5] Story Service (8082)
start "Story-8082" /min cmd /c "cd /d "%~dp0microservices\story-service" && mvn spring-boot:run -q"

timeout /t 15 /nobreak >nul

echo [4/5] API Gateway (8080)
start "Gateway-8080" /min cmd /c "cd /d "%~dp0microservices\api-gateway" && mvn spring-boot:run -q"

timeout /t 20 /nobreak >nul

echo [5/5] Frontend (5173)
start "Frontend-5173" /min cmd /c "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo ============================================================
echo All services are starting...
echo.
echo Wait 60-90 seconds for full initialization, then visit:
echo   http://localhost:5173
echo.
echo To stop: run stop-all.bat
echo ============================================================
