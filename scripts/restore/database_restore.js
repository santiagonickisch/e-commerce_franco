#!/usr/bin/env node

/**
 * Script de restauración para base de datos PostgreSQL
 * Franco Salon Exclusivo - Sistema de Restauración
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
  
  // Configuración de restauración
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
  tempDir: process.env.TEMP_DIR || path.join(__dirname, '../temp'),
  
  // Configuración de notificaciones
  emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
  emailTo: process.env.EMAIL_TO || '',
  emailFrom: process.env.EMAIL_FROM || 'backup@francosalonexclusivo.com'
};

// Función para crear directorio temporal si no existe
function ensureTempDir() {
  if (!fs.existsSync(config.tempDir)) {
    fs.mkdirSync(config.tempDir, { recursive: true });
    console.log(`✅ Directorio temporal creado: ${config.tempDir}`);
  }
}

// Función para listar backups disponibles
function listAvailableBackups() {
  try {
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('franco_salon_backup_') && file.endsWith('.sql.gz'))
      .map(file => {
        const filePath = path.join(config.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          date: stats.mtime,
          dateString: stats.mtime.toLocaleString()
        };
      })
      .sort((a, b) => b.date - a.date); // Más recientes primero
    
    return files;
  } catch (error) {
    console.error(`❌ Error listando backups: ${error.message}`);
    return [];
  }
}

// Función para descomprimir archivo de backup
function decompressBackup(backupPath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(backupPath, '.gz');
    const tempPath = path.join(config.tempDir, fileName);
    
    console.log(`🔄 Descomprimiendo backup...`);
    console.log(`📁 Origen: ${backupPath}`);
    console.log(`📁 Destino: ${tempPath}`);
    
    const command = `gunzip -c "${backupPath}" > "${tempPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error descomprimiendo backup: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup descomprimido exitosamente`);
      resolve(tempPath);
    });
  });
}

// Función para crear backup de la base de datos actual antes de restaurar
function createPreRestoreBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `pre_restore_backup_${timestamp}.sql`;
    const filePath = path.join(config.tempDir, fileName);
    
    console.log(`🔄 Creando backup de seguridad antes de restaurar...`);
    console.log(`📁 Archivo: ${filePath}`);
    
    const command = `pg_dump -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -f "${filePath}" --verbose --no-password`;
    
    const env = { ...process.env };
    if (config.dbPassword) {
      env.PGPASSWORD = config.dbPassword;
    }
    
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error creando backup de seguridad: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup de seguridad creado exitosamente`);
      resolve(filePath);
    });
  });
}

// Función para restaurar la base de datos
function restoreDatabase(sqlFilePath) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Restaurando base de datos...`);
    console.log(`📁 Archivo SQL: ${sqlFilePath}`);
    console.log(`🗄️  Base de datos: ${config.dbName}@${config.dbHost}:${config.dbPort}`);
    
    const command = `psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -f "${sqlFilePath}" --verbose`;
    
    const env = { ...process.env };
    if (config.dbPassword) {
      env.PGPASSWORD = config.dbPassword;
    }
    
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error restaurando base de datos: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Base de datos restaurada exitosamente`);
      resolve();
    });
  });
}

// Función para verificar la restauración
function verifyRestoration() {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Verificando restauración...`);
    
    const command = `psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" --no-password`;
    
    const env = { ...process.env };
    if (config.dbPassword) {
      env.PGPASSWORD = config.dbPassword;
    }
    
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error verificando restauración: ${error.message}`);
        reject(error);
        return;
      }
      
      console.log(`✅ Verificación completada`);
      console.log(`📊 Resultado: ${stdout.trim()}`);
      resolve();
    });
  });
}

// Función para limpiar archivos temporales
function cleanupTempFiles() {
  try {
    const files = fs.readdirSync(config.tempDir);
    files.forEach(file => {
      const filePath = path.join(config.tempDir, file);
      if (file.endsWith('.sql') || file.startsWith('pre_restore_backup_')) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Archivo temporal eliminado: ${file}`);
      }
    });
    console.log(`✅ Limpieza de archivos temporales completada`);
  } catch (error) {
    console.error(`❌ Error en limpieza: ${error.message}`);
  }
}

// Función para generar reporte de restauración
function generateRestoreReport(backupFile, success, error = null) {
  const report = {
    timestamp: new Date().toISOString(),
    status: success ? 'success' : 'error',
    backupFile: backupFile,
    database: {
      host: config.dbHost,
      port: config.dbPort,
      name: config.dbName
    },
    error: error ? error.message : null
  };
  
  const reportPath = path.join(config.backupDir, `restore_report_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Reporte de restauración generado: ${reportPath}`);
  return report;
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  let backupFile = args[0];
  
  try {
    console.log(`🚀 Iniciando restauración de Franco Salon Exclusivo`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    
    // Crear directorio temporal
    ensureTempDir();
    
    // Si no se especifica archivo, mostrar lista de backups disponibles
    if (!backupFile) {
      console.log(`📋 Backups disponibles:`);
      const backups = listAvailableBackups();
      
      if (backups.length === 0) {
        console.log(`❌ No se encontraron backups disponibles en ${config.backupDir}`);
        process.exit(1);
      }
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name} (${backup.sizeMB} MB) - ${backup.dateString}`);
      });
      
      console.log(`\n💡 Uso: node database_restore.js <nombre_del_archivo>`);
      console.log(`💡 Ejemplo: node database_restore.js franco_salon_backup_2024-01-15_10-30-00.sql.gz`);
      process.exit(0);
    }
    
    // Verificar que el archivo de backup existe
    const backupPath = path.join(config.backupDir, backupFile);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Archivo de backup no encontrado: ${backupPath}`);
      process.exit(1);
    }
    
    console.log(`📁 Archivo de backup: ${backupFile}`);
    
    // Crear backup de seguridad antes de restaurar
    const preRestoreBackup = await createPreRestoreBackup();
    console.log(`✅ Backup de seguridad creado: ${preRestoreBackup}`);
    
    // Descomprimir backup si es necesario
    let sqlFilePath = backupPath;
    if (backupFile.endsWith('.gz')) {
      sqlFilePath = await decompressBackup(backupPath);
    }
    
    // Restaurar base de datos
    await restoreDatabase(sqlFilePath);
    
    // Verificar restauración
    await verifyRestoration();
    
    // Limpiar archivos temporales
    cleanupTempFiles();
    
    // Generar reporte
    generateRestoreReport(backupFile, true);
    
    console.log(`\n🎉 Restauración completada exitosamente!`);
    console.log(`📁 Backup restaurado: ${backupFile}`);
    console.log(`🗄️  Base de datos: ${config.dbName}@${config.dbHost}:${config.dbPort}`);
    console.log(`⏰ Tiempo: ${new Date().toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error en restauración: ${error.message}`);
    console.error(`📅 Fecha: ${new Date().toLocaleString()}`);
    
    // Generar reporte de error
    generateRestoreReport(backupFile, false, error);
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  listAvailableBackups,
  restoreDatabase,
  generateRestoreReport,
  config
};
