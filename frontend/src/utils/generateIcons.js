// Utilidad para generar iconos PWA básicos
export const generateIconSVG = (size, text = 'F') => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2937" rx="20"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#FFD700" font-family="Dancing Script, cursive" font-size="${size * 0.6}" font-weight="bold">
        ${text}
      </text>
    </svg>
  `)}`;
};

// Generar iconos para diferentes tamaños
export const generateIcons = () => {
  const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
  
  return sizes.map(size => ({
    size,
    src: generateIconSVG(size),
    type: 'image/svg+xml'
  }));
};

// Crear iconos como archivos base64
export const createIconFiles = () => {
  const icons = generateIcons();
  
  icons.forEach(icon => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = icon.size;
    canvas.height = icon.size;
    
    // Fondo
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, icon.size, icon.size);
    
    // Texto
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${icon.size * 0.6}px Dancing Script, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', icon.size / 2, icon.size / 2);
    
    // Convertir a blob
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      console.log(`Icono ${icon.size}x${icon.size}:`, url);
    }, 'image/png');
  });
};

// Generar favicon
export const generateFavicon = () => {
  return generateIconSVG(32, 'F');
};

// Generar apple-touch-icon
export const generateAppleTouchIcon = () => {
  return generateIconSVG(192, 'F');
};
