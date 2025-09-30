import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, CheckCircle, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Checkout = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Procesar pedido
      navigate('/orders')
    }
  }

  const subtotal = 2399.97
  const shipping = 0
  const tax = subtotal * 0.21
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-black gray-particles">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ">
            <CreditCard className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 font-roboto">Checkout</h1>
          <p className="text-gray-400 text-xl">Completa tu información para finalizar la compra</p>
        </div>

        {/* Pasos */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-gold-500 text-black ' 
                    : 'bg-gray-800 text-gray-400 border border-gold-500/30'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-7 h-7" /> : <span className="text-lg font-bold">{stepNumber}</span>}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-4 transition-all duration-300 ${
                    step > stepNumber ? 'bg-gold-500' : 'bg-gray-800 border border-gold-500/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card className="elegant-card ">
              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 && (
                  <>
                    <h2 className="text-2xl font-semibold text-white mb-6 font-roboto">Información de contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Nombre</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            placeholder="Tu nombre"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Apellidos</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            placeholder="Tus apellidos"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                          placeholder="tu@email.com"
                          style={{ color: 'white' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                          placeholder="+34 600 000 000"
                          style={{ color: 'white' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-2xl font-semibold text-white mb-6 font-roboto">Dirección de envío</h2>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Dirección</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                          placeholder="Calle y número"
                          style={{ color: 'white' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Ciudad</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            placeholder="Tu ciudad"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Código postal</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            placeholder="28001"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">País</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            placeholder="España"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-2xl font-semibold text-white mb-6 font-roboto">Información de pago</h2>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Número de tarjeta</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                          style={{ color: 'white' }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Fecha de expiración</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/AA"
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">CVV</label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
                            style={{ color: 'white' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-8">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="border-gold-500 text-gray-400 hover:bg-gold-500 hover:text-black transition-all duration-300"
                    >
                      Anterior
                    </Button>
                  )}
                  <Button type="submit" className="ml-auto elegant-button">
                    {step === 3 ? 'Finalizar pedido' : 'Siguiente'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <Card className="elegant-card ">
              <h2 className="text-2xl font-semibold text-white mb-8 font-roboto">Resumen del pedido</h2>
              
              {/* Productos */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100"
                    alt="iPhone 15 Pro"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">iPhone 15 Pro</h3>
                    <p className="text-sm text-gray-300">Cantidad: 1</p>
                  </div>
                  <span className="font-medium text-gray-400">$999.99</span>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100"
                    alt="MacBook Air M2"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">MacBook Air M2</h3>
                    <p className="text-sm text-gray-300">Cantidad: 2</p>
                  </div>
                  <span className="font-medium text-gray-400">$2,399.98</span>
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-4 border-t border-gold-500/30 pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Envío</span>
                  <span className="font-medium text-gray-400">Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">IVA (21%)</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gold-500/30 pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-gray-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="mt-8 pt-6 border-t border-gold-500/30">
                <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  Pago seguro con SSL
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  Envío en 2-3 días hábiles
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  Garantía de 30 días
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
