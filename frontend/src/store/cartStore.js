import { atom, selector } from 'recoil'

// Estado del carrito
export const cartState = atom({
  key: 'cartState',
  default: []
})

// Selector para obtener el conteo de items del carrito
export const cartItemsCountSelector = selector({
  key: 'cartItemsCountSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.reduce((total, item) => total + item.quantity, 0)
  }
})

// Selector para obtener el total del carrito
export const cartTotalSelector = selector({
  key: 'cartTotalSelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
})

// Selector para obtener si el carrito está vacío
export const cartIsEmptySelector = selector({
  key: 'cartIsEmptySelector',
  get: ({ get }) => {
    const cart = get(cartState)
    return cart.length === 0
  }
})

// Funciones auxiliares para el carrito
export const cartActions = {
  // Agregar producto al carrito
  addToCart: (cart, product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si ya existe, aumentar la cantidad
      return cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      // Si no existe, agregar nuevo item
      return [...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        stock: product.stock
      }]
    }
  },

  // Actualizar cantidad de un item
  updateQuantity: (cart, productId, quantity) => {
    if (quantity <= 0) {
      return cart.filter(item => item.id !== productId)
    }
    
    return cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.min(quantity, item.stock) }
        : item
    )
  },

  // Remover item del carrito
  removeFromCart: (cart, productId) => {
    return cart.filter(item => item.id !== productId)
  },

  // Limpiar carrito
  clearCart: () => {
    return []
  }
}
