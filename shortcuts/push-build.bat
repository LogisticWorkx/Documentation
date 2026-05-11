@echo off
cd ..

call :kill_port_8000

echo Building MkDocs site...
python -m mkdocs build
if errorlevel 1 goto error

echo Starting MkDocs server...
start /B python -m mkdocs serve > .mkdocs-server.log 2>&1

echo Waiting for server...
timeout /t 5 > nul

echo Generating PDFs...
node generate-pdfs.js
if errorlevel 1 goto cleanup_error

echo Stopping MkDocs server...
call :kill_port_8000

echo Rebuilding site with PDFs...
python -m mkdocs build
if errorlevel 1 goto error

echo Deploying to GitHub Pages...
python -m mkdocs gh-deploy
if errorlevel 1 goto error

echo Done!
pause
exit /b 0

:cleanup_error
echo PDF generation failed.
call :kill_port_8000
pause
exit /b 1

:error
echo Something failed.
call :kill_port_8000
pause
exit /b 1

:kill_port_8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /T /F > nul 2>&1
)
exit /b 0