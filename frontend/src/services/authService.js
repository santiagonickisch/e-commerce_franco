import { apiService } from './api'
import toast from 'react-hot-toast'

class AuthService {
  // Registro de usuario
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData)
      
      // Guardar token y datos del usuario
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      toast.success('Usuario registrado exitosamente')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario'
      toast.error(message)
      throw error
    }
  }

  // Login de usuario
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', credentials)
      
      // Guardar token y datos del usuario
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      toast.success('Login exitoso')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
      throw error
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Sesión cerrada exitosamente')
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
  }

  // Obtener datos del usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('token')
  }

  // Verificar token
  async verifyToken() {
    try {
      const response = await apiService.get('/auth/verify')
      return response.success
    } catch (error) {
      return false
    }
  }

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener perfil'
      toast.error(message)
      throw error
    }
  }

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/auth/profile', profileData)
      
      // Actualizar datos del usuario en localStorage
      if (response.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      toast.success('Perfil actualizado exitosamente')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil'
      toast.error(message)
      throw error
    }
  }

  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const response = await apiService.put('/auth/change-password', passwordData)
      toast.success('Contraseña cambiada exitosamente')
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña'
      toast.error(message)
      throw error
    }
  }

  // Desactivar cuenta
  async deactivateAccount() {
    try {
      const response = await apiService.delete('/auth/deactivate')
      this.logout()
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Error al desactivar cuenta'
      toast.error(message)
      throw error
    }
  }

  // Verificar si el usuario es administrador
  isAdmin() {
    const user = this.getCurrentUser()
    return user?.role === 'ADMIN'
  }

  // Verificar si el usuario es cliente
  isClient() {
    const user = this.getCurrentUser()
    return user?.role === 'CLIENT'
  }
}

export default new AuthService()
