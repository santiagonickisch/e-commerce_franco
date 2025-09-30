#!/usr/bin/env node

/**
 * Script de backup para archivos del proyecto
 * Franco Salon Exclusivo - Sistema de Backup
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

// Configuración
const config = {
  // Directorios a respaldar
  sourceDirs: [
    'frontend/src',
    'frontend/public',
    'backend/src',
    'backend/scripts',
    'backend/uploads',
    'docs',
    'Cambios.md',
    'README.md'
  ],
  
  // Configuración de backup
  backupDir: process.env.FILES_BACKUP_DIR || path.join(__dirname, '../backups/files'),
  maxBackups: parseInt(process.env.MAX_FILE_BACKUPS) || 7, // 7 días
  compression: process.env.FILES_BACKUP_COMPRESSION !== 'false',
  
  // Archivos a excluir
  excludePatterns: [
    'node_modules',
    '.git',
    '.env',
    '*.log',
    '*.tmp',
    '.DS_Store',
    'Thumbs.db',
    'coverage',
    'dist',
    'build'
  ]
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
  return `franco_salon_files_${timestamp}_${time}.tar`;
}

// Función para verificar si un archivo/directorio existe
function pathExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Función para crear backup de archivos usando tar
function createFilesBackup() {
  return new Promise((resolve, reject) => {
    const fileName = generateBackupFileName();
    const filePath = path.join(config.backupDir, fileName);
    
    // Construir comando tar
    let command = 'tar -czf';
    
    // Agregar patrones de exclusión
    config.excludePatterns.forEach(pattern => {
      command += ` --exclude="${pattern}"`;
    });
    
    // Agregar archivo de salida
    command += ` "${filePath}"`;
    
    // Agregar directorios fuente
    const existingDirs = config.sourceDirs.filter(dir => pathExists(dir));
    if (existingDirs.length === 0) {
      reject(new Error('No se encontraron directorios para respaldar'));
      return;
    }
    
    command += ` ${existingDirs.join(' ')}`;
    
    console.log(`🔄 Iniciando backup de archivos...`);
    console.log(`📁 Archivo: ${filePath}`);
    console.log(`📂 Directorios: ${existingDirs.join(', ')}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error creando backup: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Backup de archivos creado exitosamente`);
      
      // Obtener tamaño del archivo
      try {
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`📊 Tamaño del backup: ${fileSizeMB} MB`);
        console.log(`📁 Archivo final: ${filePath}`);
        
        resolve({
          filePath: filePath,
          fileName: fileName,
          size: stats.size,
          sizeMB: fileSizeMB,
          timestamp: new Date().toISOString(),
          directories: existingDirs
        });
      } catch (statError) {
        console.error(`❌ Error obteniendo estadísticas: ${statError.message}`);
        reject(statError);
      }
    });
  });
}

// Función para crear backup usando rsync (alternativa)
function createFilesBackupRsync() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = path.join(config.backupDir, `franco_salon_files_${timestamp}`);
    
    // Crear directorio de backup
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    console.log(`🔄 Iniciando backup con rsync...`);
    console.log(`📁 Directorio: ${backupPath}`);
    
    // Comando rsync para cada directorio
    const rsyncCommands = config.sourceDirs
      .filter(dir => pathExists(dir))
      .map(dir => {
        const targetPath = path.join(backupPath, path.basename(dir));
        return `rsync -av --exclude-from=<(echo "${config.excludePatterns.join('\n')}") "${dir}" "${targetPath}"`;
      });
    
    if (rsyncCommands.length === 0) {
      reject(new Error('No se encontraron directorios para respaldar'));
      return;
    }
    
    // Ejecutar comandos secuencialmente
    let currentIndex = 0;
    
    function runNextCommand() {
      if (currentIndex >= rsyncCommands.length) {
        // Comprimir el directorio completo
        const compressedPath = backupPath + '.tar.gz';
        const compressCommand = `tar -czf "${compressedPath}" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`;
        
        exec(compressCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Error comprimiendo backup: ${error.message}`);
            reject(error);
            return;
          }
          
          // Eliminar directorio temporal
          exec(`rm -rf "${backupPath}"`, () => {
            try {
              const stats = fs.statSync(compressedPath);
              const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
              
              console.log(`✅ Backup de archivos creado exitosamente`);
              console.log(`📊 Tamaño del backup: ${fileSizeMB} MB`);
              console.log(`📁 Archivo final: ${compressedPath}`);
              
              resolve({
                filePath: compressedPath,
                fileName: path.basename(compressedPath),
                size: stats.size,
                sizeMB: fileSizeMB,
                timestamp: new Date().toISOString(),
                directories: config.sourceDirs.filter(dir => pathExists(dir))
              });
            } catch (statError) {
              console.error(`❌ Error obteniendo estadísticas: ${statError.message}`);
              reject(statError);
            }
          });
        });
        return;
      }
      
      exec(rsyncCommands[currentIndex], (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error en rsync: ${error.message}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.log(`📝 Log: ${stderr}`);
        }
        
        console.log(`✅ Directorio respaldado: ${config.sourceDirs[currentIndex]}`);
        currentIndex++;
        runNextCommand();
      });
    }
    
    runNextCommand();
  });
}

// Función para limpiar backups antiguos
function cleanupOldBackups() {
  return new Promise((resolve, reject) => {
    try {
      const files = fs.readdirSync(config.backupDir)
        .filter(file => file.startsWith('franco_salon_files_'))
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
            if (fs.statSync(file.path).isDirectory()) {
              exec(`rm -rf "${file.path}"`, (error) => {
                if (error) {
                  console.error(`❌ Error eliminando directorio ${file.name}: ${error.message}`);
                } else {
                  console.log(`🗑️  Eliminado directorio: ${file.name}`);
                }
              });
            } else {
              fs.unlinkSync(file.path);
              console.log(`🗑️  Eliminado archivo: ${file.name}`);
            }
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
    type: 'files',
    backup: {
      fileName: backupInfo.fileName,
      filePath: backupInfo.filePath,
      size: backupInfo.size,
      sizeMB: backupInfo.sizeMB,
      directories: backupInfo.directories
    },
    retention: {
      maxBackups: config.maxBackups,
      currentBackups: fs.readdirSync(config.backupDir).filter(f => f.startsWith('franco_salon_files_')).length
    }
  };
  
  const reportPath = path.join(config.backupDir, `files_backup_report_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Reporte generado: ${reportPath}`);
  return report;
}

// Función principal
async function main() {
  try {
    console.log(`🚀 Iniciando backup de archivos de Franco Salon Exclusivo`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`📂 Directorios: ${config.sourceDirs.join(', ')}`);
    
    // Crear directorio de backup
    ensureBackupDir();
    
    // Crear backup de archivos
    const backupInfo = await createFilesBackup();
    
    // Limpiar backups antiguos
    await cleanupOldBackups();
    
    // Generar reporte
    const report = generateBackupReport(backupInfo);
    
    console.log(`\n🎉 Backup de archivos completado exitosamente!`);
    console.log(`📁 Archivo: ${backupInfo.fileName}`);
    console.log(`📊 Tamaño: ${backupInfo.sizeMB} MB`);
    console.log(`📂 Directorios: ${backupInfo.directories.join(', ')}`);
    console.log(`⏰ Tiempo: ${new Date().toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error en backup de archivos: ${error.message}`);
    console.error(`📅 Fecha: ${new Date().toLocaleString()}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  createFilesBackup,
  createFilesBackupRsync,
  cleanupOldBackups,
  generateBackupReport,
  config
};
