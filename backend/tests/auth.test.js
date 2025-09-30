const bcrypt = require('bcryptjs');
const authService = require('../src/services/authService');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn()
    }
  }))
}));

describe('AuthService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    // Resetear todos los mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: 'user123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'CLIENT',
        isActive: true,
        createdAt: new Date()
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(authService.register(userData)).rejects.toThrow('El email ya está registrado');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'user123',
        email: credentials.email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: true
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login(credentials);

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should throw error with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'user123',
        email: credentials.email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: true
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.login(credentials)).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw error if user does not exist', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw error if user is inactive', async () => {
      const credentials = {
        email: 'inactive@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'user123',
        email: credentials.email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: false
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.login(credentials)).rejects.toThrow('Cuenta desactivada');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const token = authService.generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'user123';
      const token = authService.generateToken(userId);
      const decoded = authService.verifyToken(token);

      expect(decoded.userId).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid.token.here');
      }).toThrow('Token inválido');
    });
  });
});
