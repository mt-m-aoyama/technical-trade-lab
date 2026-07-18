@echo off
setlocal

cd /d "%~dp0"

where python.exe >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=python.exe"
  goto run_app
)

where py.exe >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=py.exe -3"
  goto run_app
)

echo Python was not found.
echo Please install Python or add it to PATH.
pause
exit /b 1

:run_app
start "Technical Trade Lab Server" /min cmd /k "%PYTHON_CMD% server.py"
timeout /t 2 /nobreak >nul
where chrome.exe >nul 2>nul
if not errorlevel 1 (
  start "" chrome.exe --new-window "http://127.0.0.1:5174/?v=20260524-3"
  goto finish
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window "http://127.0.0.1:5174/?v=20260524-3"
  goto finish
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --new-window "http://127.0.0.1:5174/?v=20260524-3"
  goto finish
)

start "" "http://127.0.0.1:5174/?v=20260524-3"

:finish
endlocal
exit /b 0
