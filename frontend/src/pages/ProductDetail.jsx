import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { isAuthenticatedState } from '@/store/authStore'
import { cartState, cartActions } from '@/store/cartStore'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  const isAuthenticated = useRecoilValue(isAuthenticatedState)
  const setCart = useSetRecoilState(cartState)

  // Datos de ejemplo - en producción esto vendría de una API
  const mockProduct = {
    id: id,
    name: 'iPhone 15 Pro',
    description: 'El último iPhone con características avanzadas, cámara profesional y rendimiento excepcional. Incluye el chip A17 Pro, cámara triple de 48MP, y pantalla Super Retina XDR de 6.1 pulgadas.',
    price: 999.99,
    originalPrice: 1099.99,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'
    ],
    category: 'Electrónicos',
    stock: 50,
    rating: 4.8,
    reviews: 1247,
    features: [
      'Chip A17 Pro con GPU de 6 núcleos',
      'Cámara triple de 48MP',
      'Pantalla Super Retina XDR de 6.1"',
      'Resistente al agua y polvo (IP68)',
      'Carga inalámbrica MagSafe',
      'iOS 17'
    ],
    specs: {
      'Pantalla': '6.1 pulgadas',
      'Procesador': 'A17 Pro',
      'Almacenamiento': '128GB',
      'RAM': '8GB',
      'Batería': 'Hasta 23 horas de reproducción de video',
      'Cámara': '48MP + 12MP + 12MP'
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      navigate('/login')
      return
    }

    setAddingToCart(true)
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCart(currentCart => cartActions.addToCart(currentCart, product, quantity))
      
      // Mostrar notificación de éxito
      alert(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.name} agregada al carrito`)
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      alert('Error al agregar al carrito')
    } finally {
      setAddingToCart(false)
    }
  }

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setProduct(mockProduct)
      setLoading(false)
    }, 1000)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Producto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Miniaturas */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-md border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews} reseñas)</span>
            </div>
            <p className="text-gray-600">{product.category}</p>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-primary">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
            )}
            <span className="text-sm text-gray-500">Stock: {product.stock} unidades</span>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Características */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Características principales</h3>
            <ul className="grid grid-cols-1 gap-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cantidad y botones */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Cantidad:</label>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                disabled={addingToCart}
                loading={addingToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {addingToCart ? 'Agregando...' : 'Agregar al carrito'}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Especificaciones técnicas */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificaciones técnicas</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">{key}</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProductDetail
