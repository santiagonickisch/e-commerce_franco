import React from 'react';

/**
 * Componente de loading optimizado
 * Diferentes tipos de spinner según el contexto
 */
const LoadingSpinner = ({ 
  size = 'md', 
  type = 'spinner', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerClasses = `${sizeClasses[size]} ${className}`;

  if (type === 'dots') {
    return (
      <div className="flex items-center justify-center space-x-1">
        <div className={`${spinnerClasses} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${spinnerClasses} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${spinnerClasses} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${spinnerClasses} bg-gray-400 rounded-full animate-pulse`}></div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-300 rounded h-4 w-3/4 mb-2"></div>
        <div className="bg-gray-300 rounded h-4 w-1/2 mb-2"></div>
        <div className="bg-gray-300 rounded h-4 w-5/6"></div>
      </div>
    );
  }

  // Spinner por defecto
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${spinnerClasses} border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin`}></div>
      {text && (
        <p className="text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
};

/**
 * Componente de loading para páginas completas
 */
export const PageLoader = ({ text = 'Cargando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-center">
      <LoadingSpinner size="xl" type="spinner" className="text-gray-400" />
      <p className="mt-4 text-gray-400 text-lg">{text}</p>
    </div>
  </div>
);

/**
 * Componente de loading para cards
 */
export const CardLoader = () => (
  <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
    <div className="bg-gray-300 rounded h-48 w-full mb-4"></div>
    <div className="bg-gray-300 rounded h-4 w-3/4 mb-2"></div>
    <div className="bg-gray-300 rounded h-4 w-1/2 mb-4"></div>
    <div className="bg-gray-300 rounded h-8 w-full"></div>
  </div>
);

/**
 * Componente de loading para listas
 */
export const ListLoader = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-gray-900 rounded-lg p-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-300 rounded h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-gray-300 rounded h-4 w-3/4"></div>
            <div className="bg-gray-300 rounded h-3 w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
