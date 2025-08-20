import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
