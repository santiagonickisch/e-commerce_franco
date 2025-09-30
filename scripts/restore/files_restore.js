#!/usr/bin/env node

/**
 * Script de restauración para archivos del proyecto
 * Franco Salon Exclusivo - Sistema de Restauración
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// Configuración
const config = {
  // Directorios de destino
  targetDirs: {
    frontend: 'frontend',
    backend: 'backend',
    docs: 'docs',
    root: '.'
  },
  
  // Configuración de restauración
  backupDir: process.env.FILES_BACKUP_DIR || path.join(__dirname, '../backups/files'),
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

// Función para listar backups de archivos disponibles
function listAvailableBackups() {
  try {
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('franco_salon_files_') && (file.endsWith('.tar') || file.endsWith('.tar.gz')))
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

// Función para crear backup de los archivos actuales antes de restaurar
function createPreRestoreBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `pre_restore_files_${timestamp}.tar.gz`;
    const filePath = path.join(config.tempDir, fileName);
    
    console.log(`🔄 Creando backup de seguridad de archivos actuales...`);
    console.log(`📁 Archivo: ${filePath}`);
    
    // Crear backup de los directorios principales
    const sourceDirs = ['frontend', 'backend', 'docs', 'Cambios.md', 'README.md'];
    const existingDirs = sourceDirs.filter(dir => fs.existsSync(dir));
    
    if (existingDirs.length === 0) {
      console.log(`⚠️  No se encontraron archivos actuales para respaldar`);
      resolve(null);
      return;
    }
    
    const command = `tar -czf "${filePath}" ${existingDirs.join(' ')}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error creando backup de seguridad: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup de seguridad de archivos creado exitosamente`);
      resolve(filePath);
    });
  });
}

// Función para extraer backup de archivos
function extractFilesBackup(backupPath) {
  return new Promise((resolve, reject) => {
    const extractDir = path.join(config.tempDir, 'extracted_files');
    
    // Crear directorio de extracción
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    console.log(`🔄 Extrayendo backup de archivos...`);
    console.log(`📁 Archivo: ${backupPath}`);
    console.log(`📁 Destino: ${extractDir}`);
    
    const command = `tar -xzf "${backupPath}" -C "${extractDir}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error extrayendo backup: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup de archivos extraído exitosamente`);
      resolve(extractDir);
    });
  });
}

// Función para restaurar archivos desde directorio extraído
function restoreFiles(extractDir) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Restaurando archivos...`);
    console.log(`📁 Origen: ${extractDir}`);
    
    // Listar contenido del directorio extraído
    const extractedContents = fs.readdirSync(extractDir);
    console.log(`📂 Contenido extraído: ${extractedContents.join(', ')}`);
    
    // Restaurar cada directorio/archivo
    const restorePromises = extractedContents.map(item => {
      return new Promise((resolveItem, rejectItem) => {
        const sourcePath = path.join(extractDir, item);
        const targetPath = path.join(process.cwd(), item);
        
        console.log(`🔄 Restaurando: ${item}`);
        
        // Si es un directorio, usar rsync
        if (fs.statSync(sourcePath).isDirectory()) {
          const command = `rsync -av --delete "${sourcePath}/" "${targetPath}/"`;
          
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`❌ Error restaurando directorio ${item}: ${error.message}`);
              rejectItem(error);
              return;
            }
            
            console.log(`✅ Directorio restaurado: ${item}`);
            resolveItem();
          });
        } else {
          // Si es un archivo, copiar directamente
          try {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`✅ Archivo restaurado: ${item}`);
            resolveItem();
          } catch (error) {
            console.error(`❌ Error restaurando archivo ${item}: ${error.message}`);
            rejectItem(error);
          }
        }
      });
    });
    
    Promise.all(restorePromises)
      .then(() => {
        console.log(`✅ Todos los archivos restaurados exitosamente`);
        resolve();
      })
      .catch(error => {
        console.error(`❌ Error restaurando archivos: ${error.message}`);
        reject(error);
      });
  });
}

// Función para verificar la restauración
function verifyRestoration() {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Verificando restauración de archivos...`);
    
    const keyFiles = [
      'frontend/src',
      'backend/src',
      'Cambios.md',
      'README.md'
    ];
    
    const missingFiles = keyFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.error(`❌ Archivos faltantes después de la restauración: ${missingFiles.join(', ')}`);
      reject(new Error(`Archivos faltantes: ${missingFiles.join(', ')}`));
      return;
    }
    
    console.log(`✅ Verificación de restauración completada`);
    console.log(`📂 Archivos verificados: ${keyFiles.join(', ')}`);
    resolve();
  });
}

// Función para limpiar archivos temporales
function cleanupTempFiles() {
  try {
    const tempDir = config.tempDir;
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        if (file.startsWith('pre_restore_files_') || file === 'extracted_files') {
          if (fs.statSync(filePath).isDirectory()) {
            exec(`rm -rf "${filePath}"`, (error) => {
              if (error) {
                console.error(`❌ Error eliminando directorio ${file}: ${error.message}`);
              } else {
                console.log(`🗑️  Directorio temporal eliminado: ${file}`);
              }
            });
          } else {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Archivo temporal eliminado: ${file}`);
          }
        }
      });
    }
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
    type: 'files',
    backupFile: backupFile,
    restoredFiles: success ? [
      'frontend/src',
      'frontend/public',
      'backend/src',
      'backend/scripts',
      'docs',
      'Cambios.md',
      'README.md'
    ] : [],
    error: error ? error.message : null
  };
  
  const reportPath = path.join(config.backupDir, `files_restore_report_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Reporte de restauración generado: ${reportPath}`);
  return report;
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  let backupFile = args[0];
  
  try {
    console.log(`🚀 Iniciando restauración de archivos de Franco Salon Exclusivo`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    
    // Crear directorio temporal
    ensureTempDir();
    
    // Si no se especifica archivo, mostrar lista de backups disponibles
    if (!backupFile) {
      console.log(`📋 Backups de archivos disponibles:`);
      const backups = listAvailableBackups();
      
      if (backups.length === 0) {
        console.log(`❌ No se encontraron backups de archivos disponibles en ${config.backupDir}`);
        process.exit(1);
      }
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name} (${backup.sizeMB} MB) - ${backup.dateString}`);
      });
      
      console.log(`\n💡 Uso: node files_restore.js <nombre_del_archivo>`);
      console.log(`💡 Ejemplo: node files_restore.js franco_salon_files_2024-01-15_10-30-00.tar.gz`);
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
    if (preRestoreBackup) {
      console.log(`✅ Backup de seguridad creado: ${preRestoreBackup}`);
    }
    
    // Extraer backup de archivos
    const extractDir = await extractFilesBackup(backupPath);
    
    // Restaurar archivos
    await restoreFiles(extractDir);
    
    // Verificar restauración
    await verifyRestoration();
    
    // Limpiar archivos temporales
    cleanupTempFiles();
    
    // Generar reporte
    generateRestoreReport(backupFile, true);
    
    console.log(`\n🎉 Restauración de archivos completada exitosamente!`);
    console.log(`📁 Backup restaurado: ${backupFile}`);
    console.log(`📂 Archivos restaurados: frontend, backend, docs, etc.`);
    console.log(`⏰ Tiempo: ${new Date().toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error en restauración de archivos: ${error.message}`);
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
  restoreFiles,
  generateRestoreReport,
  config
};
