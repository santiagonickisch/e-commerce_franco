#!/usr/bin/env node

/**
 * Script de monitoreo de backups
 * Franco Salon Exclusivo - Sistema de Monitoreo
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// Configuración
const config = {
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
  filesBackupDir: process.env.FILES_BACKUP_DIR || path.join(__dirname, '../backups/files'),
  logDir: process.env.LOG_DIR || path.join(__dirname, '../logs'),
  minFreeSpaceGB: parseInt(process.env.MIN_FREE_SPACE_GB) || 5,
  alertLowSpace: process.env.ALERT_LOW_SPACE === 'true',
  emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
  emailTo: process.env.EMAIL_TO || ''
};

// Función para verificar espacio en disco
function checkDiskSpace() {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' 
      ? `wmic logicaldisk get size,freespace,caption`
      : `df -h ${config.backupDir}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error verificando espacio en disco: ${error.message}`);
        reject(error);
        return;
      }
      
      // Parsear resultado según el sistema operativo
      let freeSpaceGB = 0;
      
      if (process.platform === 'win32') {
        // Parsear resultado de Windows
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.includes('C:')) {
            const parts = line.split(/\s+/);
            if (parts.length >= 3) {
              freeSpaceGB = parseInt(parts[1]) / (1024 * 1024 * 1024);
              break;
            }
          }
        }
      } else {
        // Parsear resultado de Linux/Mac
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          if (parts.length >= 4) {
            const freeSpaceStr = parts[3];
            if (freeSpaceStr.includes('G')) {
              freeSpaceGB = parseFloat(freeSpaceStr.replace('G', ''));
            } else if (freeSpaceStr.includes('M')) {
              freeSpaceGB = parseFloat(freeSpaceStr.replace('M', '')) / 1024;
            }
          }
        }
      }
      
      console.log(`💾 Espacio libre en disco: ${freeSpaceGB.toFixed(2)} GB`);
      
      if (freeSpaceGB < config.minFreeSpaceGB) {
        const message = `⚠️  ADVERTENCIA: Espacio en disco bajo (${freeSpaceGB.toFixed(2)} GB < ${config.minFreeSpaceGB} GB)`;
        console.warn(message);
        
        if (config.alertLowSpace) {
          sendAlert('Espacio en disco bajo', message);
        }
      }
      
      resolve({
        freeSpaceGB: freeSpaceGB,
        isLow: freeSpaceGB < config.minFreeSpaceGB
      });
    });
  });
}

// Función para verificar backups recientes
function checkRecentBackups() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Verificar backups de base de datos
    const dbBackups = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('franco_salon_backup_') && file.endsWith('.sql.gz'))
      .map(file => {
        const filePath = path.join(config.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          date: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.date - a.date);
    
    // Verificar backups de archivos
    const filesBackups = fs.readdirSync(config.filesBackupDir)
      .filter(file => file.startsWith('franco_salon_files_') && (file.endsWith('.tar') || file.endsWith('.tar.gz')))
      .map(file => {
        const filePath = path.join(config.filesBackupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          date: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.date - a.date);
    
    const report = {
      timestamp: now.toISOString(),
      database: {
        total: dbBackups.length,
        recent: dbBackups.filter(b => b.date > oneDayAgo).length,
        lastBackup: dbBackups.length > 0 ? dbBackups[0].date : null,
        isRecent: dbBackups.length > 0 && dbBackups[0].date > oneDayAgo,
        isOld: dbBackups.length > 0 && dbBackups[0].date < oneWeekAgo
      },
      files: {
        total: filesBackups.length,
        recent: filesBackups.filter(b => b.date > oneDayAgo).length,
        lastBackup: filesBackups.length > 0 ? filesBackups[0].date : null,
        isRecent: filesBackups.length > 0 && filesBackups[0].date > oneDayAgo,
        isOld: filesBackups.length > 0 && filesBackups[0].date < oneWeekAgo
      }
    };
    
    // Verificar si hay backups recientes
    if (!report.database.isRecent) {
      const message = `⚠️  ADVERTENCIA: No hay backups de base de datos recientes (último: ${report.database.lastBackup ? report.database.lastBackup.toLocaleString() : 'Nunca'})`;
      console.warn(message);
      sendAlert('Backup de base de datos faltante', message);
    }
    
    if (!report.files.isRecent) {
      const message = `⚠️  ADVERTENCIA: No hay backups de archivos recientes (último: ${report.files.lastBackup ? report.files.lastBackup.toLocaleString() : 'Nunca'})`;
      console.warn(message);
      sendAlert('Backup de archivos faltante', message);
    }
    
    // Verificar si los backups son muy antiguos
    if (report.database.isOld) {
      const message = `⚠️  ADVERTENCIA: Backup de base de datos muy antiguo (${report.database.lastBackup.toLocaleString()})`;
      console.warn(message);
      sendAlert('Backup de base de datos antiguo', message);
    }
    
    if (report.files.isOld) {
      const message = `⚠️  ADVERTENCIA: Backup de archivos muy antiguo (${report.files.lastBackup.toLocaleString()})`;
      console.warn(message);
      sendAlert('Backup de archivos antiguo', message);
    }
    
    console.log(`📊 Backups de base de datos: ${report.database.total} total, ${report.database.recent} recientes`);
    console.log(`📊 Backups de archivos: ${report.files.total} total, ${report.files.recent} recientes`);
    
    return report;
  } catch (error) {
    console.error(`❌ Error verificando backups: ${error.message}`);
    throw error;
  }
}

// Función para verificar integridad de backups
function checkBackupIntegrity() {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Verificando integridad de backups...`);
    
    const dbBackups = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('franco_salon_backup_') && file.endsWith('.sql.gz'));
    
    const filesBackups = fs.readdirSync(config.filesBackupDir)
      .filter(file => file.startsWith('franco_salon_files_') && (file.endsWith('.tar') || file.endsWith('.tar.gz')));
    
    let corruptedFiles = [];
    
    // Verificar backups de base de datos
    dbBackups.forEach(file => {
      const filePath = path.join(config.backupDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          corruptedFiles.push({ type: 'database', file, reason: 'Archivo vacío' });
        }
      } catch (error) {
        corruptedFiles.push({ type: 'database', file, reason: error.message });
      }
    });
    
    // Verificar backups de archivos
    filesBackups.forEach(file => {
      const filePath = path.join(config.filesBackupDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          corruptedFiles.push({ type: 'files', file, reason: 'Archivo vacío' });
        }
      } catch (error) {
        corruptedFiles.push({ type: 'files', file, reason: error.message });
      }
    });
    
    if (corruptedFiles.length > 0) {
      console.warn(`⚠️  ADVERTENCIA: Se encontraron ${corruptedFiles.length} archivos de backup corruptos`);
      corruptedFiles.forEach(corrupted => {
        console.warn(`   - ${corrupted.type}: ${corrupted.file} (${corrupted.reason})`);
      });
      
      sendAlert('Backups corruptos detectados', `Se encontraron ${corruptedFiles.length} archivos de backup corruptos`);
    } else {
      console.log(`✅ Todos los backups parecen estar en buen estado`);
    }
    
    resolve({
      corruptedFiles: corruptedFiles,
      isHealthy: corruptedFiles.length === 0
    });
  });
}

// Función para enviar alertas
function sendAlert(subject, message) {
  if (!config.emailNotifications || !config.emailTo) {
    console.log(`📧 Alerta (email no configurado): ${subject} - ${message}`);
    return;
  }
  
  console.log(`📧 Enviando alerta: ${subject}`);
  // Aquí se implementaría el envío real de email
}

// Función para generar reporte de monitoreo
function generateMonitoringReport(diskSpace, backups, integrity) {
  const report = {
    timestamp: new Date().toISOString(),
    diskSpace: {
      freeSpaceGB: diskSpace.freeSpaceGB,
      isLow: diskSpace.isLow,
      threshold: config.minFreeSpaceGB
    },
    backups: backups,
    integrity: integrity,
    summary: {
      healthy: !diskSpace.isLow && backups.database.isRecent && backups.files.isRecent && integrity.isHealthy,
      warnings: [
        diskSpace.isLow ? 'Espacio en disco bajo' : null,
        !backups.database.isRecent ? 'Backup de base de datos faltante' : null,
        !backups.files.isRecent ? 'Backup de archivos faltante' : null,
        !integrity.isHealthy ? 'Backups corruptos detectados' : null
      ].filter(Boolean)
    }
  };
  
  const reportPath = path.join(config.logDir, `monitoring_report_${new Date().toISOString().split('T')[0]}.json`);
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(config.logDir)) {
    fs.mkdirSync(config.logDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Reporte de monitoreo generado: ${reportPath}`);
  return report;
}

// Función principal
async function main() {
  try {
    console.log(`🔍 Iniciando monitoreo de backups de Franco Salon Exclusivo`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`📁 Directorio de backups: ${config.backupDir}`);
    console.log(`📁 Directorio de backups de archivos: ${config.filesBackupDir}`);
    console.log(``);
    
    // Verificar espacio en disco
    console.log(`🔄 Verificando espacio en disco...`);
    const diskSpace = await checkDiskSpace();
    
    // Verificar backups recientes
    console.log(`🔄 Verificando backups recientes...`);
    const backups = checkRecentBackups();
    
    // Verificar integridad de backups
    console.log(`🔄 Verificando integridad de backups...`);
    const integrity = await checkBackupIntegrity();
    
    // Generar reporte
    console.log(`🔄 Generando reporte de monitoreo...`);
    const report = generateMonitoringReport(diskSpace, backups, integrity);
    
    // Mostrar resumen
    console.log(`\n📊 RESUMEN DE MONITOREO:`);
    console.log(`💾 Espacio en disco: ${diskSpace.freeSpaceGB.toFixed(2)} GB (${diskSpace.isLow ? 'BAJO' : 'OK'})`);
    console.log(`🗄️  Backup de BD: ${backups.database.isRecent ? 'RECIENTE' : 'FALTANTE'} (${backups.database.total} total)`);
    console.log(`📁 Backup de archivos: ${backups.files.isRecent ? 'RECIENTE' : 'FALTANTE'} (${backups.files.total} total)`);
    console.log(`🔍 Integridad: ${integrity.isHealthy ? 'OK' : 'PROBLEMAS'} (${integrity.corruptedFiles.length} corruptos)`);
    console.log(`✅ Estado general: ${report.summary.healthy ? 'SALUDABLE' : 'ATENCIÓN REQUERIDA'}`);
    
    if (report.summary.warnings.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS:`);
      report.summary.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    console.log(`\n🎉 Monitoreo completado exitosamente!`);
    
    process.exit(report.summary.healthy ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Error en monitoreo: ${error.message}`);
    console.error(`📅 Fecha: ${new Date().toLocaleString()}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkDiskSpace,
  checkRecentBackups,
  checkBackupIntegrity,
  generateMonitoringReport,
  config
};
