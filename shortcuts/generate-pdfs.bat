@echo off

cd ..

echo Starting MkDocs server in separate window...

start "MkDocs Server" cmd /c "python -m mkdocs serve"

echo Waiting for server to start...
timeout /t 5 > nul

echo Generating PDFs...
node generate-pdfs.js

echo Stopping MkDocs server...

taskkill /FI "WINDOWTITLE eq MkDocs Server" /T /F > nul 2>&1

echo Done!
pause