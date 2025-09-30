// Configuración global para tests
require('dotenv').config({ path: '.env.test' });

// Configurar timeout global para tests
jest.setTimeout(10000);

// Mock de console.log para tests más limpios
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
