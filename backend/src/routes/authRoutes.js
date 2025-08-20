const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema
} = require('../utils/schemas');

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post('/register', validate(userRegisterSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Autentica un usuario existente
 * @access  Public
 */
router.post('/login', validate(userLoginSchema), authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verifica si el token es válido
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtiene el perfil del usuario actual
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualiza el perfil del usuario
 * @access  Private
 */
router.put('/profile', authenticateToken, validate(userUpdateSchema), authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambia la contraseña del usuario
 * @access  Private
 */
router.put('/change-password', authenticateToken, authController.changePassword);

/**
 * @route   DELETE /api/auth/deactivate
 * @desc    Desactiva la cuenta del usuario
 * @access  Private
 */
router.delete('/deactivate', authenticateToken, authController.deactivateAccount);

module.exports = router;
