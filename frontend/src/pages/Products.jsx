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

  // Datos de ejemplo - productos estéticos de peluquería
  const mockProducts = [
    {
      id: 1,
      name: 'Aceite de Argán Premium',
      description: 'Aceite nutritivo para cabello seco y dañado',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Aceite',
      stock: 50
    },
    {
      id: 2,
      name: 'Acondicionador Reparador',
      description: 'Acondicionador profundo para cabello tratado',
      price: 32.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Acondicionador',
      stock: 30
    },
    {
      id: 3,
      name: 'Aerosol Fijador Extra Fuerte',
      description: 'Fijación duradera para peinados profesionales',
      price: 28.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Aerosol',
      stock: 100
    },
    {
      id: 4,
      name: 'Cera Modeladora Natural',
      description: 'Cera para peinados modernos y definidos',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Cera',
      stock: 75
    },
    {
      id: 5,
      name: 'Gel Ultra Hold',
      description: 'Gel de máxima fijación para cabello rebelde',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Gel',
      stock: 60
    },
    {
      id: 6,
      name: 'Máscara Hidratante',
      description: 'Tratamiento intensivo para cabello maltratado',
      price: 38.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Mascara',
      stock: 40
    },
    {
      id: 7,
      name: 'Oxidante 20 Vol',
      description: 'Oxidante profesional para decoloración',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Oxidantes',
      stock: 80
    },
    {
      id: 8,
      name: 'Shampoo Purificante',
      description: 'Limpieza profunda para cabello graso',
      price: 26.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Shampoo',
      stock: 90
    },
    {
      id: 9,
      name: 'Spray Termoprotector',
      description: 'Protección térmica para planchas y secadores',
      price: 22.99,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      category: 'Spray',
      stock: 65
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

  const categories = ['all', 'Aceite', 'Acondicionador', 'Aerosol', 'Cera', 'Gel', 'Mascara', 'Oxidantes', 'Shampoo', 'Spray']

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
    <div className="min-h-screen bg-elegant-black gold-particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 logo-elegant">Productos Estéticos</h1>
          <p className="text-gold-400 text-lg">Descubre nuestra amplia selección de productos profesionales para peluquería</p>
        </div>

                 {/* Filtros y búsqueda */}
         <div className="elegant-card rounded-lg shadow-lg p-6 mb-8 gold-border">
           <div className="flex flex-col gap-6">
             {/* Primera fila: Búsqueda */}
             <div className="w-full">
               <div className="relative max-w-md">
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-400 h-6 w-6" />
                 <input
                   type="text"
                   placeholder="Buscar productos..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full h-16 pl-14 pr-6 bg-elegant-gray border border-gold-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 text-lg font-medium"
                   style={{ color: 'white' }}
                 />
               </div>
             </div>

             {/* Segunda fila: Controles */}
             <div className="flex flex-wrap items-center gap-4">
               {/* Categorías */}
               <div className="flex flex-wrap gap-2">
                 {categories.map((category) => (
                   <Button
                     key={category}
                     variant={selectedCategory === category ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => setSelectedCategory(category)}
                     className="whitespace-nowrap"
                   >
                     {category === 'all' ? 'Todas' : category}
                   </Button>
                 ))}
               </div>

               {/* Ordenamiento */}
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="px-4 py-2 bg-elegant-gray border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300"
               >
                 <option value="name" className="bg-elegant-gray">Ordenar por nombre</option>
                 <option value="price-low" className="bg-elegant-gray">Precio: menor a mayor</option>
                 <option value="price-high" className="bg-elegant-gray">Precio: mayor a mayor</option>
               </select>

               {/* Vista */}
               <div className="flex border border-gold-500/30 rounded-lg overflow-hidden">
                 <button
                   onClick={() => setViewMode('grid')}
                   className={`p-3 ${viewMode === 'grid' ? 'bg-gold-500 text-black' : 'bg-elegant-gray text-gold-400 hover:bg-gold-500/20'}`}
                 >
                   <Grid className="h-5 w-5" />
                 </button>
                 <button
                   onClick={() => setViewMode('list')}
                   className={`p-3 ${viewMode === 'list' ? 'bg-gold-500 text-black' : 'bg-elegant-gray text-gold-400 hover:bg-gold-500/20'}`}
                 >
                   <List className="h-5 w-5" />
                 </button>
               </div>
             </div>
           </div>
         </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gold-400 text-lg">
            Mostrando {sortedProducts.length} de {products.length} productos
          </p>
        </div>

      {/* Grid de productos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="elegant-card hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 group hover:scale-105 gold-border overflow-hidden">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-gold-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  EXCLUSIVO
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-white">{product.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-bold text-gold-400">${product.price}</span>
                  <span className="text-sm text-gold-300">Stock: {product.stock}</span>
                </div>
                <Button 
                  className="w-full flex items-center justify-center gap-2 elegant-button"
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
        <div className="space-y-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="elegant-card hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 group hover:scale-[1.02] gold-border overflow-hidden">
              <div className="flex">
                <div className="w-48 h-48 flex-shrink-0 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-gold-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    EXCLUSIVO
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h3 className="font-semibold text-2xl mb-3 text-white">{product.name}</h3>
                  <p className="text-gray-300 mb-4 text-lg">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-gold-400">${product.price}</span>
                      <span className="text-sm text-gold-300">Stock: {product.stock}</span>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                      loading={addingToCart === product.id}
                      className="elegant-button px-8 py-3"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addingToCart === product.id ? 'Agregando...' : 'Agregar al carrito'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gold-400 text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
