import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo - en producción esto vendría de una API
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'DELIVERED',
      total: 999.99,
      items: [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          price: 999.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100'
        }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'SHIPPED',
      total: 2399.97,
      items: [
        {
          id: 2,
          name: 'MacBook Air M2',
          price: 1199.99,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100'
        }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'PENDING',
      total: 79.99,
      items: [
        {
          id: 3,
          name: 'Jeans Clásicos',
          price: 79.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100'
        }
      ]
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pendiente',
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gold-400',
          bgColor: 'bg-gold-500/20',
          borderColor: 'border-gold-500/30'
        }
      case 'CONFIRMED':
        return {
          label: 'Confirmado',
          icon: <Package className="w-5 h-5" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        }
      case 'SHIPPED':
        return {
          label: 'Enviado',
          icon: <Truck className="w-5 h-5" />,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30'
        }
      case 'DELIVERED':
        return {
          label: 'Entregado',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        }
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        }
      default:
        return {
          label: 'Desconocido',
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gold-400',
          bgColor: 'bg-gold-500/20',
          borderColor: 'border-gold-500/30'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-elegant-black gold-particles flex items-center justify-center">
        <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center gold-glow">
          <div className="spinner w-8 h-8 text-gold-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-elegant-black gray-particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 gold-glow">
            <ShoppingBag className="w-12 h-12 text-gold-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 font-roboto">Mis Pedidos</h1>
          <p className="text-gold-400 text-xl">Revisa el estado de tus pedidos y el historial de compras</p>
        </div>

        {orders.length === 0 ? (
          <Card className="elegant-card gold-border">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 gold-glow">
                <Package className="w-12 h-12 text-gold-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-roboto">No tienes pedidos aún</h2>
              <p className="text-gold-400 text-lg mb-8">Comienza a comprar para ver tus pedidos aquí.</p>
              <Link to="/products">
                <Button className="elegant-button">
                  Explorar productos
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              
              return (
                <Card key={order.id} className="elegant-card gold-border hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500">
                  {/* Header del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-6 border-b border-gold-500/30">
                    <div>
                      <h3 className="text-2xl font-semibold text-white font-roboto">Pedido {order.id}</h3>
                      <p className="text-gold-400 text-lg">
                        Realizado el {new Date(order.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                      <span className="text-2xl font-bold text-gold-400">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Productos del pedido */}
                  <div className="space-y-6 mb-8">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 p-4 bg-elegant-gray rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg">{item.name}</h4>
                          <p className="text-gold-300">Cantidad: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-gold-400 text-xl">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gold-500/30">
                    <Button variant="outline" className="flex-1 sm:flex-none border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                      Ver detalles
                    </Button>
                    
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" className="flex-1 sm:flex-none border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                        Dejar reseña
                      </Button>
                    )}
                    
                    {order.status === 'PENDING' && (
                      <Button variant="outline" className="flex-1 sm:flex-none border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                        Cancelar pedido
                      </Button>
                    )}
                    
                    <Button variant="outline" className="flex-1 sm:flex-none border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                      Descargar factura
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
