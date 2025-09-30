@echo off
REM Script de backup de archivos para Windows
REM Franco Salon Exclusivo - Sistema de Backup

echo ========================================
echo   FRANCO SALON EXCLUSIVO - FILES BACKUP
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

echo Iniciando backup de archivos...
echo Fecha: %date% %time%
echo.

REM Ejecutar backup de archivos
node scripts/backup/files_backup.js

if errorlevel 1 (
    echo.
    echo ERROR: El backup de archivos fallo
    pause
    exit /b 1
) else (
    echo.
    echo SUCCESS: Backup de archivos completado exitosamente
    pause
)
