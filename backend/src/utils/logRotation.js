const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuración de rotación de logs
const config = {
  logDir: process.env.LOG_DIR || './logs',
  maxFileSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  compressionEnabled: process.env.LOG_COMPRESSION !== 'false',
  cleanupInterval: 24 * 60 * 60 * 1000 // 24 horas
};

// Función para rotar logs manualmente
const rotateLogs = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Iniciando rotación manual de logs...');
    
    const command = `find ${config.logDir} -name "*.log" -size +${config.maxFileSize} -exec mv {} {}.old \\;`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error rotando logs: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log('✅ Rotación de logs completada');
      resolve();
    });
  });
};

// Función para comprimir logs antiguos
const compressOldLogs = () => {
  return new Promise((resolve, reject) => {
    if (!config.compressionEnabled) {
      resolve();
      return;
    }
    
    console.log('🔄 Comprimiendo logs antiguos...');
    
    const command = `find ${config.logDir} -name "*.log.old" -exec gzip {} \\;`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error comprimiendo logs: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log('✅ Compresión de logs completada');
      resolve();
    });
  });
};

// Función para limpiar logs antiguos
const cleanupOldLogs = () => {
  return new Promise((resolve, reject) => {
    console.log('🧹 Limpiando logs antiguos...');
    
    const command = `find ${config.logDir} -name "*.log.*" -mtime +${config.maxFiles} -delete`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error limpiando logs: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log('✅ Limpieza de logs completada');
      resolve();
    });
  });
};

// Función para obtener estadísticas de logs
const getLogStats = () => {
  try {
    const files = fs.readdirSync(config.logDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    let totalSize = 0;
    let fileCount = 0;
    
    logFiles.forEach(file => {
      const filePath = path.join(config.logDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      fileCount++;
    });
    
    return {
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileCount: fileCount,
      logDir: config.logDir
    };
  } catch (error) {
    console.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    return null;
  }
};

// Función para monitorear tamaño de logs
const monitorLogSize = () => {
  const stats = getLogStats();
  
  if (!stats) {
    return;
  }
  
  const maxSizeMB = parseInt(config.maxFileSize.replace('m', ''));
  
  if (stats.totalSizeMB > maxSizeMB) {
    console.warn(`⚠️  ADVERTENCIA: Logs exceden el tamaño máximo (${stats.totalSizeMB}MB > ${maxSizeMB}MB)`);
    return true;
  }
  
  return false;
};

// Función para rotación automática
const autoRotate = async () => {
  try {
    console.log('🔄 Iniciando rotación automática de logs...');
    
    // Verificar si es necesario rotar
    if (!monitorLogSize()) {
      console.log('✅ Logs dentro del tamaño normal, no se requiere rotación');
      return;
    }
    
    // Rotar logs
    await rotateLogs();
    
    // Comprimir logs antiguos
    await compressOldLogs();
    
    // Limpiar logs muy antiguos
    await cleanupOldLogs();
    
    console.log('✅ Rotación automática completada');
  } catch (error) {
    console.error(`❌ Error en rotación automática: ${error.message}`);
  }
};

// Función para configurar rotación automática
const setupAutoRotation = () => {
  // Ejecutar rotación cada 24 horas
  setInterval(autoRotate, config.cleanupInterval);
  
  console.log(`✅ Rotación automática configurada (cada ${config.cleanupInterval / (60 * 60 * 1000)} horas)`);
};

// Función para exportar logs
const exportLogs = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFile = `logs_export_${timestamp}.tar.gz`;
    const exportPath = path.join(config.logDir, exportFile);
    
    console.log(`📦 Exportando logs desde ${startDate} hasta ${endDate}...`);
    
    const command = `find ${config.logDir} -name "*.log*" -newermt "${startDate}" ! -newermt "${endDate}" -exec tar -czf ${exportPath} {} +`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error exportando logs: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`📝 Log: ${stderr}`);
      }
      
      console.log(`✅ Logs exportados: ${exportPath}`);
      resolve(exportPath);
    });
  });
};

// Función para analizar logs
const analyzeLogs = () => {
  try {
    const files = fs.readdirSync(config.logDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    
    logFiles.forEach(file => {
      const filePath = path.join(config.logDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.includes('"level":"error"')) errorCount++;
        else if (line.includes('"level":"warn"')) warningCount++;
        else if (line.includes('"level":"info"')) infoCount++;
      });
    });
    
    return {
      errorCount,
      warningCount,
      infoCount,
      totalLogs: errorCount + warningCount + infoCount
    };
  } catch (error) {
    console.error(`❌ Error analizando logs: ${error.message}`);
    return null;
  }
};

module.exports = {
  rotateLogs,
  compressOldLogs,
  cleanupOldLogs,
  getLogStats,
  monitorLogSize,
  autoRotate,
  setupAutoRotation,
  exportLogs,
  analyzeLogs,
  config
};
