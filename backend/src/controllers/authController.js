const authService = require('../services/authService');

/**
 * Controlador de autenticación
 * Maneja las rutas relacionadas con autenticación de usuarios
 */
class AuthController {
  /**
   * Registra un nuevo usuario
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autentica un usuario existente
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el perfil del usuario
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambia la contraseña del usuario
   * PUT /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Desactiva la cuenta del usuario
   * DELETE /api/auth/deactivate
   */
  async deactivateAccount(req, res, next) {
    try {
      const result = await authService.deactivateAccount(req.user.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica si el token es válido
   * GET /api/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      // Si llegamos aquí, el token es válido (middleware de auth ya lo verificó)
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
