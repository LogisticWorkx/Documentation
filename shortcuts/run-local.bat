@echo off
cd ..

echo Starting MkDocs server...

start "" http://127.0.0.1:8000

python -m mkdocs serve