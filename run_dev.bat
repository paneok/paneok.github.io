@echo off
cd /d "%~dp0"

REM Запуск локального сервера на порту 8080
python run_dev.py 8080

pause