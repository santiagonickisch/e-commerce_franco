#!/usr/bin/env node

/**
 * Script de backup para base de datos PostgreSQL
 * Franco Salon Exclusivo - Sistema de Backup
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración
const config = {
  // Configuración de la base de datos
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || '5432',
  dbName: process.env.DB_NAME || 'franco_salon_db',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || '',
  
  // Configuración de backup
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
  maxBackups: parseInt(process.env.MAX_BACKUPS) || 30, // 30 días
  compression: process.env.BACKUP_COMPRESSION !== 'false',
  
  // Configuración de notificaciones
  emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
  emailTo: process.env.EMAIL_TO || '',
  emailFrom: process.env.EMAIL_FROM || 'backup@francosalonexclusivo.com'
};

// Función para crear directorio de backup si no existe
function ensureBackupDir() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`✅ Directorio de backup creado: ${config.backupDir}`);
  }
}

// Función para generar nombre de archivo de backup
function generateBackupFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
  return `franco_salon_backup_${timestamp}_${time}.sql`;
}

// Función para comprimir archivo de backup
function compressBackup(filePath) {
  return new Promise((resolve, reject) => {
    if (!config.compression) {
      resolve(filePath);
      return;
    }

    const compressedPath = filePath + '.gz';
    const command = `gzip "${filePath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error comprimiendo backup: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`✅ Backup comprimido: ${compressedPath}`);
      resolve(compressedPath);
    });
  });
}

// Función para crear backup de la base de datos
function createDatabaseBackup() {
  return new Promise((resolve, reject) => {
    const fileName = generateBackupFileName();
    const filePath = path.join(config.backupDir, fileName);
    
    // Comando pg_dump
    const command = `pg_dump -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -f "${filePath}" --verbose --no-password`;
    
    // Configurar variable de entorno para contraseña
    const env = { ...process.env };
    if (config.dbPassword) {
      env.PGPASSWORD = config.dbPassword;
    }
    
    console.log(`🔄 Iniciando backup de base de datos...`);
    console.log(`📁 Archivo: ${filePath}`);
    
    exec(command, { env }, async (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error creando backup: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup de base de datos creado exitosamente`);
      
      try {
        // Comprimir backup si está habilitado
        const finalPath = await compressBackup(filePath);
        
        // Obtener tamaño del archivo
        const stats = fs.statSync(finalPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`📊 Tamaño del backup: ${fileSizeMB} MB`);
        console.log(`📁 Archivo final: ${finalPath}`);
        
        resolve({
          filePath: finalPath,
          fileName: path.basename(finalPath),
          size: stats.size,
          sizeMB: fileSizeMB,
          timestamp: new Date().toISOString()
        });
      } catch (compressError) {
        console.error(`❌ Error comprimiendo backup: ${compressError.message}`);
        reject(compressError);
      }
    });
  });
}

// Función para limpiar backups antiguos
function cleanupOldBackups() {
  return new Promise((resolve, reject) => {
    try {
      const files = fs.readdirSync(config.backupDir)
        .filter(file => file.startsWith('franco_salon_backup_'))
        .map(file => {
          const filePath = path.join(config.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime); // Más recientes primero
      
      if (files.length > config.maxBackups) {
        const filesToDelete = files.slice(config.maxBackups);
        console.log(`🧹 Limpiando ${filesToDelete.length} backups antiguos...`);
        
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
            console.log(`🗑️  Eliminado: ${file.name}`);
          } catch (error) {
            console.error(`❌ Error eliminando ${file.name}: ${error.message}`);
          }
        });
        
        console.log(`✅ Limpieza completada`);
      } else {
        console.log(`✅ No hay backups antiguos para eliminar`);
      }
      
      resolve();
    } catch (error) {
      console.error(`❌ Error en limpieza: ${error.message}`);
      reject(error);
    }
  });
}

// Función para generar reporte de backup
function generateBackupReport(backupInfo) {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'success',
    database: {
      host: config.dbHost,
      port: config.dbPort,
      name: config.dbName
    },
    backup: {
      fileName: backupInfo.fileName,
      filePath: backupInfo.filePath,
      size: backupInfo.size,
      sizeMB: backupInfo.sizeMB,
      compressed: config.compression
    },
    retention: {
      maxBackups: config.maxBackups,
      currentBackups: fs.readdirSync(config.backupDir).filter(f => f.startsWith('franco_salon_backup_')).length
    }
  };
  
  const reportPath = path.join(config.backupDir, `backup_report_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Reporte generado: ${reportPath}`);
  return report;
}

// Función principal
async function main() {
  try {
    console.log(`🚀 Iniciando backup de Franco Salon Exclusivo`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`🗄️  Base de datos: ${config.dbName}@${config.dbHost}:${config.dbPort}`);
    
    // Crear directorio de backup
    ensureBackupDir();
    
    // Crear backup de la base de datos
    const backupInfo = await createDatabaseBackup();
    
    // Limpiar backups antiguos
    await cleanupOldBackups();
    
    // Generar reporte
    const report = generateBackupReport(backupInfo);
    
    console.log(`\n🎉 Backup completado exitosamente!`);
    console.log(`📁 Archivo: ${backupInfo.fileName}`);
    console.log(`📊 Tamaño: ${backupInfo.sizeMB} MB`);
    console.log(`⏰ Tiempo: ${new Date().toLocaleString()}`);
    
    // Enviar notificación por email si está configurado
    if (config.emailNotifications && config.emailTo) {
      console.log(`📧 Enviando notificación por email...`);
      // Aquí se podría implementar envío de email
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error en backup: ${error.message}`);
    console.error(`📅 Fecha: ${new Date().toLocaleString()}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  createDatabaseBackup,
  cleanupOldBackups,
  generateBackupReport,
  config
};
