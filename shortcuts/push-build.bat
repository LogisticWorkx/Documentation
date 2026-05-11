@echo off
cd ..

echo Building MkDocs site...
python -m mkdocs build
if errorlevel 1 goto error

echo Starting MkDocs server silently...
powershell -NoProfile -Command "Start-Process python -ArgumentList '-m mkdocs serve' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id > .mkdocs-server.pid"

echo Waiting for server...
timeout /t 5 > nul

node generate-pdfs.js
if errorlevel 1 goto cleanup_error

echo Stopping MkDocs server...
for /f %%i in (.mkdocs-server.pid) do taskkill /PID %%i /T /F > nul 2>&1
del .mkdocs-server.pid > nul 2>&1

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
echo Stopping MkDocs server...
for /f %%i in (.mkdocs-server.pid) do taskkill /PID %%i /T /F > nul 2>&1
del .mkdocs-server.pid > nul 2>&1
pause
exit /b 1

:error
echo Something failed.
pause
exit /b 1