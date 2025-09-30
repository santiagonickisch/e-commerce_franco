# 💾 Sistema de Backup - Franco Salon Exclusivo

Sistema completo de backup y restauración para el proyecto Franco Salon Exclusivo.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Automatización](#automatización)
- [Monitoreo](#monitoreo)
- [Restauración](#restauración)
- [Troubleshooting](#troubleshooting)

## 🚀 Características

### ✅ Backup de Base de Datos
- Backup completo de PostgreSQL
- Compresión automática (gzip)
- Retención configurable de backups
- Verificación de integridad

### ✅ Backup de Archivos
- Backup de código fuente
- Backup de archivos estáticos
- Exclusión de archivos innecesarios
- Compresión automática

### ✅ Automatización
- Scripts para Windows (.bat)
- Scripts para Linux/Mac (.sh)
- Programación automática
- Notificaciones por email

### ✅ Monitoreo
- Verificación de espacio en disco
- Alertas por backups faltantes
- Verificación de integridad
- Reportes automáticos

### ✅ Restauración
- Restauración de base de datos
- Restauración de archivos
- Backup de seguridad antes de restaurar
- Verificación post-restauración

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ instalado
- PostgreSQL instalado y configurado
- Acceso a la base de datos

### Instalación
```bash
# Navegar al directorio del proyecto
cd /ruta/al/proyecto

# Instalar dependencias (si es necesario)
npm install

# Crear directorios de backup
mkdir -p backups/files logs temp
```

## ⚙️ Configuración

### 1. Archivo de Configuración
Copia el archivo de ejemplo y configura las variables:

```bash
cp scripts/backup/config.env.example scripts/backup/.env
```

### 2. Variables de Configuración

#### Base de Datos
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=franco_salon_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

#### Directorios
```env
BACKUP_DIR=./backups
FILES_BACKUP_DIR=./backups/files
TEMP_DIR=./temp
LOG_DIR=./logs
```

#### Retención
```env
MAX_BACKUPS=30          # Días para backups de BD
MAX_FILE_BACKUPS=7     # Días para backups de archivos
```

#### Notificaciones
```env
EMAIL_NOTIFICATIONS=true
EMAIL_TO=admin@francosalonexclusivo.com
EMAIL_FROM=backup@francosalonexclusivo.com
```

## 🎯 Uso

### Backup Completo
```bash
# Ejecutar backup completo (base de datos + archivos)
node scripts/backup/full_backup.js

# O usando el script de Windows
scripts/backup/backup.bat
```

### Backup de Base de Datos
```bash
# Solo backup de base de datos
node scripts/backup/database_backup.js

# O usando el script de Windows
scripts/backup/database_backup.bat
```

### Backup de Archivos
```bash
# Solo backup de archivos
node scripts/backup/files_backup.js

# O usando el script de Windows
scripts/backup/files_backup.bat
```

### Monitoreo
```bash
# Verificar estado de backups
node scripts/backup/backup_monitor.js
```

## 🔄 Automatización

### Windows (Task Scheduler)
1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Configurar para ejecutar diariamente
4. Acción: Ejecutar `scripts/backup/backup.bat`

### Linux/Mac (Cron)
```bash
# Editar crontab
crontab -e

# Backup diario a las 2:00 AM
0 2 * * * cd /ruta/al/proyecto && node scripts/backup/full_backup.js

# Monitoreo cada 6 horas
0 */6 * * * cd /ruta/al/proyecto && node scripts/backup/backup_monitor.js
```

### Docker (Opcional)
```dockerfile
# Dockerfile para backup
FROM node:18-alpine
WORKDIR /app
COPY scripts/ ./scripts/
RUN npm install
CMD ["node", "scripts/backup/full_backup.js"]
```

## 📊 Monitoreo

### Verificación Automática
El sistema de monitoreo verifica:
- ✅ Espacio disponible en disco
- ✅ Backups recientes (últimas 24h)
- ✅ Integridad de archivos de backup
- ✅ Tamaño de backups

### Alertas
- ⚠️ Espacio en disco bajo
- ⚠️ Backups faltantes
- ⚠️ Archivos corruptos
- ⚠️ Backups muy antiguos

### Reportes
Los reportes se generan en:
- `logs/monitoring_report_YYYY-MM-DD.json`
- `backups/backup_report_YYYY-MM-DD.json`

## 🔧 Restauración

### Restaurar Base de Datos
```bash
# Listar backups disponibles
node scripts/restore/database_restore.js

# Restaurar backup específico
node scripts/restore/database_restore.js franco_salon_backup_2024-01-15_10-30-00.sql.gz
```

### Restaurar Archivos
```bash
# Listar backups de archivos disponibles
node scripts/restore/files_restore.js

# Restaurar backup específico
node scripts/restore/files_restore.js franco_salon_files_2024-01-15_10-30-00.tar.gz
```

### Proceso de Restauración
1. **Backup de seguridad**: Se crea un backup de los datos actuales
2. **Extracción**: Se extrae el backup seleccionado
3. **Restauración**: Se restauran los datos
4. **Verificación**: Se verifica que la restauración fue exitosa
5. **Limpieza**: Se eliminan archivos temporales

## 🛠️ Troubleshooting

### Problemas Comunes

#### Error: "pg_dump no encontrado"
```bash
# Verificar que PostgreSQL está instalado
pg_dump --version

# Agregar PostgreSQL al PATH
export PATH=$PATH:/usr/local/pgsql/bin
```

#### Error: "Espacio en disco insuficiente"
```bash
# Verificar espacio disponible
df -h

# Limpiar backups antiguos
node scripts/backup/backup_monitor.js
```

#### Error: "Permisos denegados"
```bash
# Dar permisos de ejecución
chmod +x scripts/backup/*.js
chmod +x scripts/restore/*.js
```

### Logs y Debugging

#### Ver logs de backup
```bash
# Ver logs del día actual
tail -f logs/backup_$(date +%Y-%m-%d).log

# Ver logs de monitoreo
cat logs/monitoring_report_$(date +%Y-%m-%d).json
```

#### Modo debug
```bash
# Ejecutar con logs detallados
DEBUG=true node scripts/backup/full_backup.js
```

## 📁 Estructura de Archivos

```
scripts/
├── backup/
│   ├── full_backup.js          # Backup completo
│   ├── database_backup.js      # Backup de BD
│   ├── files_backup.js         # Backup de archivos
│   ├── backup_monitor.js       # Monitoreo
│   ├── backup.bat              # Script Windows completo
│   ├── database_backup.bat     # Script Windows BD
│   ├── files_backup.bat        # Script Windows archivos
│   └── config.env.example      # Configuración ejemplo
├── restore/
│   ├── database_restore.js     # Restaurar BD
│   └── files_restore.js        # Restaurar archivos
└── README.md                   # Esta documentación
```

## 🔒 Seguridad

### Mejores Prácticas
- ✅ Cambiar contraseñas por defecto
- ✅ Usar variables de entorno para credenciales
- ✅ Limitar acceso a directorios de backup
- ✅ Encriptar backups sensibles
- ✅ Rotar claves de encriptación

### Configuración de Seguridad
```env
# Encriptar backups
ENCRYPT_BACKUPS=true
ENCRYPTION_KEY=clave_segura_aqui

# Subir a cloud storage
UPLOAD_TO_CLOUD=true
CLOUD_PROVIDER=aws
```

## 📞 Soporte

### Contacto
- Email: admin@francosalonexclusivo.com
- Documentación: Ver `Cambios.md`

### Logs de Error
Los errores se registran en:
- `logs/backup_YYYY-MM-DD.log`
- `logs/monitoring_report_YYYY-MM-DD.json`

### Reportar Problemas
1. Revisar logs de error
2. Verificar configuración
3. Probar en modo debug
4. Contactar soporte con logs

---

**Franco Salon Exclusivo** - Sistema de Backup v1.0.0
