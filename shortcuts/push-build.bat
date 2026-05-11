@echo off

cd ..

echo Building MkDocs site...
python -m mkdocs build

if errorlevel 1 (
    echo Initial MkDocs build failed.
    pause
    exit /b 1
)

echo Starting MkDocs server in separate window...
start "MkDocs Server" cmd /c "python -m mkdocs serve"

echo Waiting for server to start...
timeout /t 5 > nul

echo Generating PDFs...
node generate-pdfs.js

if errorlevel 1 (
    echo PDF generation failed.
    taskkill /FI "WINDOWTITLE eq MkDocs Server" /T /F > nul 2>&1
    pause
    exit /b 1
)

echo Stopping MkDocs server...
taskkill /FI "WINDOWTITLE eq MkDocs Server" /T /F > nul 2>&1

echo Rebuilding site with generated PDFs...
python -m mkdocs build

if errorlevel 1 (
    echo Final MkDocs build failed.
    pause
    exit /b 1
)

echo Deploying to GitHub Pages...
python -m mkdocs gh-deploy

echo Done!
pause