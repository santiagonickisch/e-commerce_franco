import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, Info } from 'lucide-react';
import useServiceWorker from '@/hooks/useServiceWorker';

const CacheInfo = () => {
  const { cacheSize, getCacheSize, clearCache, isInstalled } = useServiceWorker();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      getCacheSize();
    }
  }, [isInstalled, getCacheSize]);

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearCache();
      // Recargar la página después de limpiar caché
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error limpiando caché:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    setIsLoading(true);
    try {
      await getCacheSize();
    } catch (error) {
      console.error('Error actualizando caché:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInstalled) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Información del Caché</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Elementos en caché:</span>
          <span className="text-white font-medium">{cacheSize}</span>
        </div>

        {showDetails && (
          <div className="bg-gray-700 rounded p-3 space-y-2">
            <p className="text-sm text-gray-300">
              El caché mejora la velocidad de carga y permite navegación offline.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Archivos estáticos: CSS, JS, imágenes</p>
              <p>• Páginas visitadas: Productos, carrito, perfil</p>
              <p>• Datos de API: Respuestas recientes</p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleRefreshCache}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleClearCache}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Limpiar</span>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          <p>💡 Limpiar el caché liberará espacio pero puede ralentizar la carga inicial</p>
        </div>
      </div>
    </div>
  );
};

export default CacheInfo;
