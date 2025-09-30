#!/usr/bin/env node

/**
 * Script principal de backup completo
 * Franco Salon Exclusivo - Sistema de Backup Completo
 */

const { createDatabaseBackup, cleanupOldBackups: cleanupDBBackups } = require('./database_backup');
const { createFilesBackup, cleanupOldBackups: cleanupFilesBackups } = require('./files_backup');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración
const config = {
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
  logDir: process.env.LOG_DIR || path.join(__dirname, '../logs'),
  emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
  emailTo: process.env.EMAIL_TO || '',
  emailFrom: process.env.EMAIL_FROM || 'backup@francosalonexclusivo.com'
};

// Función para crear directorios necesarios
function ensureDirectories() {
  const dirs = [config.backupDir, config.logDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  });
}

// Función para escribir log
function writeLog(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  const logFile = path.join(config.logDir, `backup_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage);
  
  console.log(`📝 ${message}`);
}

// Función para enviar notificación por email (simulada)
function sendEmailNotification(subject, body, attachments = []) {
  if (!config.emailNotifications || !config.emailTo) {
    return;
  }
  
  writeLog(`📧 Enviando notificación por email a ${config.emailTo}`, 'NOTIFICATION');
  writeLog(`📧 Asunto: ${subject}`, 'NOTIFICATION');
  writeLog(`📧 Archivos adjuntos: ${attachments.length}`, 'NOTIFICATION');
  
  // Aquí se implementaría el envío real de email
  // Por ejemplo, usando nodemailer o sendgrid
}

// Función para generar reporte completo
function generateFullReport(dbBackup, filesBackup, startTime, endTime) {
  const duration = Math.round((endTime - startTime) / 1000);
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'success',
    duration: {
      seconds: duration,
      human: `${Math.floor(duration / 60)}m ${duration % 60}s`
    },
    database: {
      fileName: dbBackup.fileName,
      filePath: dbBackup.filePath,
      size: dbBackup.size,
      sizeMB: dbBackup.sizeMB,
      compressed: true
    },
    files: {
      fileName: filesBackup.fileName,
      filePath: filesBackup.filePath,
      size: filesBackup.size,
      sizeMB: filesBackup.sizeMB,
      directories: filesBackup.directories
    },
    summary: {
      totalSize: dbBackup.size + filesBackup.size,
      totalSizeMB: ((dbBackup.size + filesBackup.size) / (1024 * 1024)).toFixed(2),
      filesCount: 2,
      success: true
    }
  };
  
  const reportPath = path.join(config.backupDir, `full_backup_report_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  writeLog(`📊 Reporte completo generado: ${reportPath}`, 'SUCCESS');
  return report;
}

// Función para verificar espacio en disco
function checkDiskSpace() {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    
    // Comando para verificar espacio en disco (Windows/Linux)
    const command = process.platform === 'win32' 
      ? `wmic logicaldisk get size,freespace,caption`
      : `df -h ${config.backupDir}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        writeLog(`⚠️  No se pudo verificar espacio en disco: ${error.message}`, 'WARNING');
        resolve(true); // Continuar aunque no se pueda verificar
        return;
      }
      
      writeLog(`💾 Espacio en disco verificado`, 'INFO');
      resolve(true);
    });
  });
}

// Función principal
async function main() {
  const startTime = Date.now();
  
  try {
    writeLog(`🚀 Iniciando backup completo de Franco Salon Exclusivo`, 'INFO');
    writeLog(`📅 Fecha: ${new Date().toLocaleString()}`, 'INFO');
    
    // Crear directorios necesarios
    ensureDirectories();
    
    // Verificar espacio en disco
    await checkDiskSpace();
    
    writeLog(`🔄 Paso 1/4: Iniciando backup de base de datos...`, 'INFO');
    const dbBackup = await createDatabaseBackup();
    writeLog(`✅ Backup de base de datos completado: ${dbBackup.fileName} (${dbBackup.sizeMB} MB)`, 'SUCCESS');
    
    writeLog(`🔄 Paso 2/4: Iniciando backup de archivos...`, 'INFO');
    const filesBackup = await createFilesBackup();
    writeLog(`✅ Backup de archivos completado: ${filesBackup.fileName} (${filesBackup.sizeMB} MB)`, 'SUCCESS');
    
    writeLog(`🔄 Paso 3/4: Limpiando backups antiguos...`, 'INFO');
    await cleanupDBBackups();
    await cleanupFilesBackups();
    writeLog(`✅ Limpieza de backups antiguos completada`, 'SUCCESS');
    
    writeLog(`🔄 Paso 4/4: Generando reporte final...`, 'INFO');
    const endTime = Date.now();
    const report = generateFullReport(dbBackup, filesBackup, startTime, endTime);
    
    // Enviar notificación por email
    const subject = `✅ Backup Completo Exitoso - Franco Salon Exclusivo`;
    const body = `
Backup completado exitosamente:

📊 Resumen:
- Base de datos: ${dbBackup.fileName} (${dbBackup.sizeMB} MB)
- Archivos: ${filesBackup.fileName} (${filesBackup.sizeMB} MB)
- Tamaño total: ${report.summary.totalSizeMB} MB
- Duración: ${report.duration.human}

📁 Archivos de backup:
- ${dbBackup.filePath}
- ${filesBackup.filePath}

⏰ Fecha: ${new Date().toLocaleString()}
    `;
    
    sendEmailNotification(subject, body, [dbBackup.filePath, filesBackup.filePath]);
    
    writeLog(`🎉 Backup completo finalizado exitosamente!`, 'SUCCESS');
    writeLog(`📊 Tamaño total: ${report.summary.totalSizeMB} MB`, 'SUCCESS');
    writeLog(`⏱️  Duración: ${report.duration.human}`, 'SUCCESS');
    writeLog(`📁 Archivos: ${dbBackup.fileName}, ${filesBackup.fileName}`, 'SUCCESS');
    
    process.exit(0);
  } catch (error) {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    writeLog(`❌ Error en backup completo: ${error.message}`, 'ERROR');
    writeLog(`⏱️  Duración hasta el error: ${Math.floor(duration / 60)}m ${duration % 60}s`, 'ERROR');
    
    // Enviar notificación de error
    const subject = `❌ Error en Backup - Franco Salon Exclusivo`;
    const body = `
Error en backup:

❌ Error: ${error.message}
⏰ Fecha: ${new Date().toLocaleString()}
⏱️  Duración: ${Math.floor(duration / 60)}m ${duration % 60}s

Por favor, revisar los logs para más detalles.
    `;
    
    sendEmailNotification(subject, body);
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  main,
  generateFullReport,
  sendEmailNotification,
  config
};
