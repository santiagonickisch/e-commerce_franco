@echo off
REM Script de backup de base de datos para Windows
REM Franco Salon Exclusivo - Sistema de Backup

echo ========================================
echo   FRANCO SALON EXCLUSIVO - DB BACKUP
echo ========================================
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0..\.."

REM Verificar que Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

REM Verificar que PostgreSQL está instalado
pg_dump --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo Iniciando backup de base de datos...
echo Fecha: %date% %time%
echo.

REM Ejecutar backup de base de datos
node scripts/backup/database_backup.js

if errorlevel 1 (
    echo.
    echo ERROR: El backup de base de datos fallo
    pause
    exit /b 1
) else (
    echo.
    echo SUCCESS: Backup de base de datos completado exitosamente
    pause
)
