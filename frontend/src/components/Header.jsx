import React, { useState } from 'react'
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
  
  const navigate = useNavigate()
  const user = useRecoilValue(userState)
  const isAuthenticated = useRecoilValue(isAuthenticatedState)
  const cartItemsCount = useRecoilValue(cartItemsCountSelector)
  const isAdmin = useRecoilValue(isAdminSelector)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/products' },
  ]

  if (isAdmin) {
    navigation.push(
      { name: 'Admin', href: '/admin' }
    )
  }

  return (
    <header className="bg-elegant-black shadow-lg border-b border-gold-500/20 sticky top-0 z-50 gold-particles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="text-center">
                <div className="logo-script group-hover:scale-105 transition-transform duration-300">
                  franco
                </div>
                <div className="logo-elegant text-white text-sm tracking-widest mt-1">
                  SALÓN EXCLUSIVO
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-gold-400 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gold-500/10 hover:shadow-lg hover:shadow-gold-500/20"
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
              className="relative p-2 text-white hover:text-gold-400 transition-all duration-300 hover:bg-gold-500/10 rounded-lg"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold gold-glow">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gold-500/10 transition-all duration-300 text-white hover:text-gold-400"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 elegant-card rounded-lg shadow-xl py-1 z-50 gold-border">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gold-500/10 hover:text-gold-400 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Perfil
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gold-500/10 hover:text-gold-400 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gold-500/10 hover:text-gold-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-gold-400 hover:bg-gold-500/10">
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
              className="md:hidden p-2 rounded-lg text-white hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-300"
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gold-500/20">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-gold-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gold-500/10 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:text-gold-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gold-500/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="text-white hover:text-gold-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-gold-500/10 transition-all duration-300"
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
