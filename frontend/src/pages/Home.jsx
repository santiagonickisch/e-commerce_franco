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
    { name: 'Aceite', icon: '💧', count: 45 },
    { name: 'Acondicionador', icon: '✨', count: 38 },
    { name: 'Aerosol', icon: '🌪️', count: 52 },
    { name: 'Cera', icon: '🕯️', count: 28 },
    { name: 'Gel', icon: '🧴', count: 41 },
    { name: 'Mascara', icon: '🎭', count: 33 },
    { name: 'Oxidantes', icon: '⚗️', count: 19 },
    { name: 'Shampoo', icon: '🧼', count: 67 },
    { name: 'Spray', icon: '💨', count: 44 }
  ]

  return (
    <div className="min-h-screen bg-elegant-black gray-particles">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-elegant-black via-elegant-dark to-elegant-gray text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 logo-script">
                Bienvenido a
              </h1>
              <div className="text-6xl md:text-8xl font-bold mb-6 logo-script">
                franco
              </div>
              <div className="text-2xl md:text-3xl logo-elegant tracking-widest mb-8">
                SALÓN EXCLUSIVO
              </div>
            </div>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Descubre una experiencia de compra única con productos exclusivos, 
              servicio personalizado y la elegancia que mereces.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/products">
                <Button size="lg" className="elegant-button text-lg px-10 py-4 text-black font-bold">
                  Explorar Productos
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-black transition-all duration-300 gold-border">
                  Únete Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-elegant-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 logo-elegant">
              Explora por Categorías
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre nuestras colecciones exclusivas cuidadosamente seleccionadas para ti
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="elegant-card rounded-xl p-8 text-center hover:shadow-2xl hover:shadow-gray-500/20 transition-all duration-500 group hover:scale-105 gold-border"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="font-semibold text-white mb-2 text-lg">{category.name}</h3>
                <p className="text-sm text-gray-400 font-medium">{category.count} productos exclusivos</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-elegant-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 logo-elegant">
              Productos Exclusivos
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre nuestra selección premium de productos únicos y de alta calidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="elegant-card hover:shadow-2xl hover:shadow-gray-500/20 transition-all duration-500 group hover:scale-105 gold-border overflow-hidden">
                <CardHeader className="p-0 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-gray-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    EXCLUSIVO
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3 text-white">{product.name}</h3>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-gray-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-2">
                      ({product.reviews} reseñas)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-400">
                      ${product.price}
                    </span>
                    <Button size="sm" className="elegant-button">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link to="/products">
              <Button size="lg" className="elegant-button text-lg px-12 py-4">
                Ver Todos los Productos
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-elegant-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 logo-elegant">
              ¿Por qué elegir Franco?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ofrecemos una experiencia de compra exclusiva y personalizada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 gold-glow group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Envío Premium</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Envío express gratuito en pedidos superiores a $100 con seguimiento en tiempo real
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 gold-glow group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Garantía Exclusiva</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                60 días de garantía extendida en todos nuestros productos premium
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 text-black rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 gold-glow group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Servicio VIP</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Asesor personal disponible 24/7 para brindarte la mejor experiencia
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
