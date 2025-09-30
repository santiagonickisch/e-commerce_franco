import { useState, useEffect } from 'react';

const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          setSwRegistration(registration);
          setIsInstalled(true);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nueva versión disponible
                console.log('Nueva versión del Service Worker disponible');
                // Aquí se puede mostrar notificación al usuario
              }
            });
          });
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    }

    // Escuchar cambios de conectividad
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Obtener tamaño del caché
  const getCacheSize = async () => {
    if (swRegistration) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_SIZE') {
              resolve(event.data.size);
            }
          };
        });

        swRegistration.active.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [messageChannel.port2]
        );

        const size = await promise;
        setCacheSize(size);
        return size;
      } catch (error) {
        console.error('Error obteniendo tamaño del caché:', error);
        return 0;
      }
    }
    return 0;
  };

  // Limpiar caché
  const clearCache = async () => {
    if (swRegistration) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_CLEARED') {
              resolve();
            }
          };
        });

        swRegistration.active.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );

        await promise;
        setCacheSize(0);
        console.log('Caché limpiado');
      } catch (error) {
        console.error('Error limpiando caché:', error);
      }
    }
  };

  // Actualizar Service Worker
  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Sincronizar en segundo plano
  const syncInBackground = () => {
    if ('serviceWorker' in navigator && swRegistration) {
      swRegistration.sync.register('background-sync');
    }
  };

  // Enviar notificación push
  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  };

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    isOnline,
    isInstalled,
    cacheSize,
    getCacheSize,
    clearCache,
    updateServiceWorker,
    syncInBackground,
    sendNotification,
    requestNotificationPermission
  };
};

export default useServiceWorker;
