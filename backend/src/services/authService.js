const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Servicio de autenticación
 * Maneja el registro, login y generación de tokens JWT
 */
class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Usuario creado sin contraseña
   */
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Encriptar contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'CLIENT' // Por defecto todos los usuarios son clientes
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Generar token JWT
    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  /**
   * Autentica un usuario existente
   * @param {Object} credentials - Credenciales de login
   * @returns {Object} Usuario autenticado y token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.isActive) {
      throw new AppError('Cuenta desactivada', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token JWT
    const token = this.generateToken(user.id);

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Genera un token JWT
   * @param {string} userId - ID del usuario
   * @returns {string} Token JWT
   */
  generateToken(userId) {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Payload del token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   * @param {string} userId - ID del usuario
   * @returns {Object} Perfil del usuario
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }

  /**
   * Actualiza el perfil del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  async updateProfile(userId, updateData) {
    const { firstName, lastName, email } = updateData;

    // Si se está actualizando el email, verificar que no exista
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new AppError('El email ya está en uso', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Cambia la contraseña del usuario
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Object} Confirmación del cambio
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    // Encriptar nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Desactiva la cuenta del usuario
   * @param {string} userId - ID del usuario
   * @returns {Object} Confirmación de desactivación
   */
  async deactivateAccount(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    return { message: 'Cuenta desactivada exitosamente' };
  }
}

module.exports = new AuthService();

