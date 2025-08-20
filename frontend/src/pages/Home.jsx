import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const Home = () => {
  // Productos destacados de ejemplo
  const featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 999.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      price: 1199.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: 'Auriculares Inalámbricos',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: 'Lámpara de Mesa LED',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      rating: 4.6,
      reviews: 78
    }
  ]

  const categories = [
    { name: 'Electrónicos', icon: '📱', count: 150 },
    { name: 'Ropa', icon: '👕', count: 200 },
    { name: 'Hogar', icon: '🏠', count: 100 },
    { name: 'Deportes', icon: '⚽', count: 75 },
    { name: 'Libros', icon: '📚', count: 300 },
    { name: 'Juguetes', icon: '🎮', count: 120 }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Descubre Productos Increíbles
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              La mejor selección de productos con precios increíbles. 
              Envío rápido y garantía de satisfacción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="text-lg px-8 py-3">
                  Ver Productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por Categorías
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow border"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} productos</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600">
              Los productos más populares y mejor valorados por nuestros clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">
                Ver Todos los Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-gray-600">
              Ofrecemos la mejor experiencia de compra online
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">
                Envío gratis en pedidos superiores a $50
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Garantía</h3>
              <p className="text-gray-600">
                30 días de garantía en todos los productos
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">
                Atención al cliente disponible todo el día
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
