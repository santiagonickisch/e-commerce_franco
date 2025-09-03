import React from 'react'
import { Link } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { cartState, cartActions, cartTotalSelector, cartIsEmptySelector } from '@/store/cartStore'
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Cart = () => {
  const cartItems = useRecoilValue(cartState)
  const setCart = useSetRecoilState(cartState)
  const total = useRecoilValue(cartTotalSelector)
  const isEmpty = useRecoilValue(cartIsEmptySelector)

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    
    setCart(currentCart => cartActions.updateQuantity(currentCart, id, newQuantity))
  }

  const removeItem = (id) => {
    setCart(currentCart => cartActions.removeFromCart(currentCart, id))
  }

  const subtotal = total
  const shipping = subtotal > 1000 ? 0 : 29.99
  const tax = subtotal * 0.21 // 21% IVA
  const totalWithTax = subtotal + shipping + tax

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-elegant-black gold-particles">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 gold-glow">
              <svg className="w-12 h-12 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 logo-elegant">Tu carrito está vacío</h2>
            <p className="text-gold-400 text-lg mb-8">Parece que aún no has agregado productos a tu carrito.</p>
            <Link to="/products">
              <Button className="elegant-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-elegant-black gray-particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 logo-elegant">Carrito de compras</h1>
          <p className="text-gold-400 text-lg">Revisa tus productos antes de finalizar la compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="elegant-card hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 group hover:scale-105 gold-border overflow-hidden">
                  <div className="flex items-center gap-6 p-6">
                    {/* Imagen */}
                    <div className="w-32 h-32 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-gold-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                        {item.quantity}x
                      </div>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-xl truncate mb-2">{item.name}</h3>
                      <p className="text-gold-300 text-sm mb-3">Stock disponible: {item.stock}</p>
                      <p className="text-gold-400 text-lg font-medium">${item.price} c/u</p>
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center border border-gold-500/30 rounded-lg bg-elegant-gray">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-4 py-3 hover:bg-gold-500/20 text-gold-400 transition-colors rounded-l-lg"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-3 border-x border-gold-500/30 min-w-[4rem] text-center text-white font-bold text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-4 py-3 hover:bg-gold-500/20 text-gold-400 transition-colors rounded-r-lg"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Precio Total */}
                    <div className="text-right min-w-[8rem]">
                      <p className="font-bold text-gold-400 text-2xl">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gold-300">Total</p>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-4 text-gold-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-lg"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <Card className="elegant-card gold-border">
              <h2 className="text-2xl font-semibold text-white mb-6 logo-elegant">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gold-300">Subtotal</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gold-300">Envío</span>
                  <span className="font-medium text-white">
                    {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gold-300">IVA (21%)</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gold-500/30 pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-gold-400">${totalWithTax.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gold-300 mt-1">
                    {shipping === 0 ? 'Envío gratis incluido' : 'Envío incluido'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/checkout">
                  <Button className="w-full elegant-button">
                    Proceder al checkout
                  </Button>
                </Link>
                
                <Link to="/products">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continuar comprando
                  </Button>
                </Link>
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gold-500/30">
                <div className="flex items-center gap-2 text-sm text-gold-300 mb-2">
                  <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Envío seguro y rápido
                </div>
                <div className="flex items-center gap-2 text-sm text-gold-300 mb-2">
                  <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Garantía de 60 días
                </div>
                <div className="flex items-center gap-2 text-sm text-gold-300">
                  <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Devolución gratuita
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
