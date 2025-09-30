/**
 * Utilidades para optimización de imágenes
 */

/**
 * Generar URL optimizada para diferentes tamaños
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '/placeholder.jpg';
  
  const {
    width = 400,
    height = 300,
    quality = 80,
    format = 'webp'
  } = options;

  // Si es una URL externa, usar un servicio de optimización
  if (url.startsWith('http')) {
    // Ejemplo con Cloudinary (gratuito hasta 25GB)
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/`);
    }
    
    // Ejemplo con ImageKit (gratuito hasta 20GB)
    if (url.includes('ik.imagekit.io')) {
      return `${url}?tr=w-${width},h-${height},q-${quality},f-${format}`;
    }
    
    // Para otras URLs, devolver la original
    return url;
  }
  
  // Para URLs locales, devolver tal como están
  return url;
};

/**
 * Generar srcSet para responsive images
 */
export const generateSrcSet = (baseUrl, sizes = [400, 800, 1200]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Generar sizes attribute para responsive images
 */
export const generateSizes = (breakpoints = {
  sm: '100vw',
  md: '50vw',
  lg: '33vw',
  xl: '25vw'
}) => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(min-width: ${breakpoint === 'sm' ? '640px' : breakpoint === 'md' ? '768px' : breakpoint === 'lg' ? '1024px' : '1280px'}) ${size}`)
    .join(', ') + ', 100vw';
};

/**
 * Lazy loading con Intersection Observer
 */
export const createLazyImageObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

/**
 * Preload de imágenes críticas
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload de múltiples imágenes
 */
export const preloadImages = async (urls) => {
  try {
    await Promise.all(urls.map(url => preloadImage(url)));
    return true;
  } catch (error) {
    console.warn('Error preloading images:', error);
    return false;
  }
};

/**
 * Detectar si el navegador soporta WebP
 */
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Obtener el formato óptimo según el navegador
 */
export const getOptimalFormat = () => {
  if (supportsWebP()) {
    return 'webp';
  }
  return 'jpg';
};

/**
 * Generar placeholder blur
 */
export const generateBlurPlaceholder = (width = 40, height = 30) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Optimizar imagen para diferentes dispositivos
 */
export const getResponsiveImageProps = (src, alt, options = {}) => {
  const {
    sizes = [400, 800, 1200],
    aspectRatio = '16:9',
    quality = 80
  } = options;

  const baseUrl = getOptimizedImageUrl(src, { quality });
  const srcSet = generateSrcSet(baseUrl, sizes);
  const sizesAttr = generateSizes();

  return {
    src: getOptimizedImageUrl(src, { width: 400, quality }),
    srcSet,
    sizes: sizesAttr,
    alt,
    loading: 'lazy',
    decoding: 'async'
  };
};

/**
 * Hook para lazy loading de imágenes
 */
export const useLazyImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const observer = createLazyImageObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      options
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
  }, [isInView, src]);

  return {
    ref: imgRef,
    isLoaded,
    isInView,
    hasError
  };
};
