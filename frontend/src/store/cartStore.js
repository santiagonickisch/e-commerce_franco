import { atom, selector } from 'recoil'

// Estado del carrito
export const cartState = atom({
  key: 'cartState',
  default: [],
})

// Estado de carga del carrito
export const cartLoadingState = atom({
  key: 'cartLoadingState',
  default: false,
})

// Selector para obtener el total de items en el carrito
export const cartItemsCountSelector = selector({
  key: 'cartItemsCountSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.reduce((total, item) => total + item.quantity, 0)
  },
})

// Selector para obtener el total del carrito
export const cartTotalSelector = selector({
  key: 'cartTotalSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  },
})

// Selector para verificar si el carrito está vacío
export const isCartEmptySelector = selector({
  key: 'isCartEmptySelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.length === 0
  },
})

// Selector para obtener un item específico del carrito
export const cartItemSelector = selector({
  key: 'cartItemSelector',
  get: ({ get }) => {
    return (productId) => {
      const cart = get(cartState)
      return cart.find(item => item.productId === productId)
    }
  },
})

// Selector para obtener el subtotal (sin impuestos)
export const cartSubtotalSelector = selector({
  key: 'cartSubtotalSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  },
})

// Selector para calcular impuestos (ejemplo: 16%)
export const cartTaxSelector = selector({
  key: 'cartTaxSelector',
  get: ({ get }) => {
    const subtotal = get(cartSubtotalSelector)
    return subtotal * 0.16 // 16% de impuestos
  },
})

// Selector para el total con impuestos
export const cartTotalWithTaxSelector = selector({
  key: 'cartTotalWithTaxSelector',
  get: ({ get }) => {
    const subtotal = get(cartSubtotalSelector)
    const tax = get(cartTaxSelector)
    return subtotal + tax
  },
})

// Selector para obtener productos únicos en el carrito
export const uniqueCartItemsSelector = selector({
  key: 'uniqueCartItemsSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    const uniqueItems = []
    const seen = new Set()
    
    cart.forEach(item => {
      if (!seen.has(item.productId)) {
        seen.add(item.productId)
        uniqueItems.push(item)
      }
    })
    
    return uniqueItems
  },
})
