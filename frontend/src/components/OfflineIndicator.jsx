import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      setShowIndicator(true);
      
      // Ocultar indicador después de 3 segundos
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReconnect = () => {
    setIsReconnecting(true);
    
    // Intentar reconectar
    fetch('/api/health')
      .then(() => {
        setIsOnline(true);
        setIsReconnecting(false);
        setShowIndicator(true);
        
        setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
      })
      .catch(() => {
        setIsReconnecting(false);
      });
  };

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isOnline ? 'bg-green-600' : 'bg-red-600'
    } text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}>
      {isOnline ? (
        <>
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Conexión restaurada</p>
            <p className="text-sm opacity-90">Ya puedes navegar normalmente</p>
          </div>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5" />
          <div className="flex-1">
            <p className="font-medium">Sin conexión</p>
            <p className="text-sm opacity-90">
              Algunas funciones pueden estar limitadas
            </p>
          </div>
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="ml-2 p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {isReconnecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
