import React, { useState, useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { userState, isAuthenticatedState } from '@/store/authStore'
import { cartState, cartActions } from '@/store/cartStore'
import { Search, Filter, Grid, List, ShoppingCart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [addingToCart, setAddingToCart] = useState(null)

  const user = useRecoilValue(userState)
  const isAuthenticated = useRecoilValue(isAuthenticatedState)
  const setCart = useSetRecoilState(cartState)

  // Datos de ejemplo - en producción esto vendría de una API
  const mockProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      description: 'El último iPhone con características avanzadas',
      price: 999.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      category: 'Electrónicos',
      stock: 50
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      description: 'Laptop ultraligera con chip M2',
      price: 1199.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      category: 'Electrónicos',
      stock: 30
    },
    {
      id: 3,
      name: 'Camiseta Básica',
      description: 'Camiseta de algodón 100% orgánico',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      category: 'Ropa',
      stock: 100
    },
    {
      id: 4,
      name: 'Jeans Clásicos',
      description: 'Jeans de alta calidad con ajuste perfecto',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      category: 'Ropa',
      stock: 75
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return 0
    }
  })

  const categories = ['all', 'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros']

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login'
      return
    }

    setAddingToCart(product.id)
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCart(currentCart => cartActions.addToCart(currentCart, product))
      
      // Mostrar notificación de éxito
      alert(`${product.name} agregado al carrito`)
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      alert('Error al agregar al carrito')
    } finally {
      setAddingToCart(null)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-gray-600">Descubre nuestra amplia selección de productos</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Todas' : category}
              </Button>
            ))}
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="name">Ordenar por nombre</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
          </select>

          {/* Vista */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Mostrando {sortedProducts.length} de {products.length} productos
        </p>
      </div>

      {/* Grid de productos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-primary">${product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === product.id}
                  loading={addingToCart === product.id}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart === product.id ? 'Agregando...' : 'Agregar al carrito'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="flex">
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">${product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id}
                    loading={addingToCart === product.id}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {addingToCart === product.id ? 'Agregando...' : 'Agregar al carrito'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}

export default Products
