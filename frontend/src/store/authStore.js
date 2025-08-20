import { atom, selector } from 'recoil'
import authService from '../services/authService'

// Estado del usuario
export const userState = atom({
  key: 'userState',
  default: authService.getCurrentUser(),
})

// Estado de autenticación
export const isAuthenticatedState = atom({
  key: 'isAuthenticatedState',
  default: authService.isAuthenticated(),
})

// Estado de carga
export const loadingState = atom({
  key: 'loadingState',
  default: false,
})

// Selector para obtener el usuario actual
export const currentUserSelector = selector({
  key: 'currentUserSelector',
  get: ({ get }) => {
    return get(userState)
  },
})

// Selector para verificar si es administrador
export const isAdminSelector = selector({
  key: 'isAdminSelector',
  get: ({ get }) => {
    const user = get(userState)
    return user?.role === 'ADMIN'
  },
})

// Selector para verificar si es cliente
export const isClientSelector = selector({
  key: 'isClientSelector',
  get: ({ get }) => {
    const user = get(userState)
    return user?.role === 'CLIENT'
  },
})

// Selector para obtener el nombre completo del usuario
export const userFullNameSelector = selector({
  key: 'userFullNameSelector',
  get: ({ get }) => {
    const user = get(userState)
    if (!user) return ''
    return `${user.firstName} ${user.lastName}`
  },
})

// Selector para obtener las iniciales del usuario
export const userInitialsSelector = selector({
  key: 'userInitialsSelector',
  get: ({ get }) => {
    const user = get(userState)
    if (!user) return ''
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  },
})
