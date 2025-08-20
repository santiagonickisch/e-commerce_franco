import axios from 'axios'
import toast from 'react-hot-toast'

// Crear instancia de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // Manejar errores de autenticación
    if (response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }

    // Manejar errores de validación
    if (response?.status === 400) {
      const message = response.data?.message || 'Error de validación'
      toast.error(message)
    }

    // Manejar errores del servidor
    if (response?.status >= 500) {
      toast.error('Error del servidor. Intenta de nuevo más tarde.')
    }

    return Promise.reject(error)
  }
)

// Funciones helper para las peticiones
export const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default api
