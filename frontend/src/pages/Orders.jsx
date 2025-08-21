import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
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
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        }
      case 'CONFIRMED':
        return {
          label: 'Confirmado',
          icon: <Package className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200'
        }
      case 'SHIPPED':
        return {
          label: 'Enviado',
          icon: <Truck className="w-5 h-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200'
        }
      case 'DELIVERED':
        return {
          label: 'Entregado',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        }
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        }
      default:
        return {
          label: 'Desconocido',
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
        <p className="text-gray-600">Revisa el estado de tus pedidos y el historial de compras</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-600 mb-8">Comienza a comprar para ver tus pedidos aquí.</p>
            <Link to="/products">
              <Button>
                Explorar productos
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            
            return (
              <Card key={order.id}>
                {/* Header del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pedido {order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Realizado el {new Date(order.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                    <span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    Ver detalles
                  </Button>
                  
                  {order.status === 'DELIVERED' && (
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Dejar reseña
                    </Button>
                  )}
                  
                  {order.status === 'PENDING' && (
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Cancelar pedido
                    </Button>
                  )}
                  
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    Descargar factura
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders
