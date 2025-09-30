import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para optimizar consultas a la API
 * Incluye caché, debouncing y retry automático
 */
const useOptimizedQuery = (queryFn, options = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000, // 10 minutos
    retry = 3,
    retryDelay = 1000,
    debounceMs = 300
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef(new Map());
  const retryCountRef = useRef(0);
  const debounceTimeoutRef = useRef(null);
  const lastFetchRef = useRef(0);

  const generateCacheKey = useCallback((params) => {
    return JSON.stringify(params || {});
  }, []);

  const isDataFresh = useCallback((timestamp) => {
    return Date.now() - timestamp < staleTime;
  }, [staleTime]);

  const fetchData = useCallback(async (params = {}) => {
    if (!enabled) return;

    const cacheKey = generateCacheKey(params);
    const cachedData = cacheRef.current.get(cacheKey);
    
    // Verificar si tenemos datos en caché y son frescos
    if (cachedData && isDataFresh(cachedData.timestamp)) {
      setData(cachedData.data);
      setLoading(false);
      setError(null);
      setIsStale(false);
      return cachedData.data;
    }

    // Si los datos están en caché pero son stale, mostrarlos mientras cargamos
    if (cachedData) {
      setData(cachedData.data);
      setIsStale(true);
    }

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn(params);
      
      // Guardar en caché
      const cacheData = {
        data: result,
        timestamp: Date.now()
      };
      cacheRef.current.set(cacheKey, cacheData);
      
      setData(result);
      setLoading(false);
      setError(null);
      setIsStale(false);
      retryCountRef.current = 0;
      
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      
      // Retry automático
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(params);
        }, retryDelay * retryCountRef.current);
      }
      
      throw err;
    }
  }, [queryFn, enabled, staleTime, retry, retryDelay, generateCacheKey, isDataFresh]);

  const debouncedFetch = useCallback((params = {}) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData(params);
    }, debounceMs);
  }, [fetchData, debounceMs]);

  const invalidateCache = useCallback((params = null) => {
    if (params) {
      const cacheKey = generateCacheKey(params);
      cacheRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
    }
    setIsStale(true);
  }, [generateCacheKey]);

  const refetch = useCallback((params = {}) => {
    invalidateCache(params);
    return fetchData(params);
  }, [fetchData, invalidateCache]);

  // Limpiar caché expirado
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > cacheTime) {
          cacheRef.current.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, 60000); // Limpiar cada minuto
    return () => clearInterval(interval);
  }, [cacheTime]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidateCache,
    fetchData: debouncedFetch
  };
};

export default useOptimizedQuery;
