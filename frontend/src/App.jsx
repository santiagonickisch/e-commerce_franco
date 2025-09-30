import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import useCoreWebVitals from './hooks/useCoreWebVitals'
import OfflineIndicator from './components/OfflineIndicator'

// Componentes lazy-loaded para mejor performance
const Layout = lazy(() => import('./components/Layout'))
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Orders = lazy(() => import('./pages/Orders'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Componente de loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="spinner w-8 h-8"></div>
  </div>
)

function App() {
  // Medir Core Web Vitals
  useCoreWebVitals();

  return (
    <>
      <OfflineIndicator />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route path="checkout" element={<Checkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          
          {/* Rutas de administración */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/products" element={<AdminProducts />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App
