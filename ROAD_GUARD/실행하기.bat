@echo off
chcp 65001 >nul
cd /d "%~dp0website"
start "" "http://localhost:8000"
python -m http.server 8000
if errorlevel 1 (
 echo.
 echo Python 실행에 실패했습니다. VS Code Live Server 또는 "py -m http.server 8000" 명령을 사용하세요.
 pause
)
