import { useEffect } from 'react';

const useCoreWebVitals = () => {
  useEffect(() => {
    // Medir Largest Contentful Paint (LCP)
    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Enviar métrica a analytics si es necesario
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Web Vitals'
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Medir First Input Delay (FID)
    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Web Vitals'
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    };

    // Medir Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      let clsValue = 0;
      let clsEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        console.log('CLS:', clsValue);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Web Vitals'
          });
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // Medir First Contentful Paint (FCP)
    const measureFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'FCP',
                value: Math.round(entry.startTime),
                event_category: 'Web Vitals'
              });
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    };

    // Inicializar mediciones
    if ('PerformanceObserver' in window) {
      measureLCP();
      measureFID();
      measureCLS();
      measureFCP();
    }

    // Cleanup
    return () => {
      // Los observers se limpian automáticamente
    };
  }, []);
};

export default useCoreWebVitals;
