import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { ShoppingCart, Menu, X, User, LogOut, Settings } from 'lucide-react'
import { 
  userState, 
  isAuthenticatedState, 
  isAdminSelector 
} from '@/store/authStore'
import { cartItemsCountSelector } from '@/store/cartStore'
import { cn } from '@/utils/cn'
import Button from './ui/Button'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  
  const navigate = useNavigate()
  const user = useRecoilValue(userState)
  const isAuthenticated = useRecoilValue(isAuthenticatedState)
  const cartItemsCount = useRecoilValue(cartItemsCountSelector)
  const isAdmin = useRecoilValue(isAdminSelector)

  // Manejo de clics fuera del menú de usuario
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  // Crear navegación de forma inmutable
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Inicio', href: '/' },
      { name: 'Productos', href: '/products' },
    ]
    
    if (isAdmin) {
      return [...baseNavigation, { name: 'Admin', href: '/admin' }]
    }
    
    return baseNavigation
  }

  const navigation = getNavigation()

  return (
          <header className="bg-black shadow-lg border-b border-gray-500/20 sticky top-0 z-50 gray-particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="logo-container">
                <img 
                  src="/logo-franco.jpg" 
                  alt="Franco Salon Exclusivo" 
                  className="logo-image h-16 w-auto object-contain"
                />
                <div className="logo-gradient"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-gray-400 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-500/10 hover:shadow-lg hover:shadow-gray-500/20"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-white hover:text-gray-400 transition-all duration-300 hover:bg-gray-500/10 rounded-lg"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative z-50" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-500/10 transition-all duration-300 text-white hover:text-gray-400"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menú de usuario"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="fixed right-4 top-20 w-48 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl py-2 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors border-b border-gray-600 font-roboto"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-300" />
                      Perfil
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors border-b border-gray-600 font-roboto"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <ShoppingCart className="h-4 w-4 mr-3 text-gray-300" />
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-red-600 transition-colors font-roboto"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-300" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-gray-400 hover:bg-gray-500/10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="elegant-button">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:text-gray-400 hover:bg-gray-500/10 transition-all duration-300"
              aria-expanded={isMenuOpen}
              aria-label="Menú de navegación"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" role="navigation" aria-label="Navegación móvil">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-500/20">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-gray-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-500/10 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-gray-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-500/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="text-white hover:text-gray-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-500/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
