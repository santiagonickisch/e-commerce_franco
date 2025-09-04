import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { userState } from '@/store/authStore'
import { User, Mail, Phone, MapPin, Edit, Save, X, Shield, Bell, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const Profile = () => {
  const user = useRecoilValue(userState)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log('Guardando cambios:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      postalCode: user?.postalCode || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-elegant-black gray-particles">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 gold-glow">
            <User className="w-12 h-12 text-gold-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 font-roboto">Mi Perfil</h1>
          <p className="text-gold-400 text-xl">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="lg:col-span-2">
            <Card className="elegant-card gold-border">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-white font-roboto">Información personal</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 elegant-button"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2 border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex items-center gap-2 elegant-button"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gold-300 text-sm font-medium mb-2">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gold-300 text-sm font-medium mb-2">Apellidos</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                      placeholder="Calle y número"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gold-300 text-sm font-medium mb-2">Ciudad</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                        placeholder="Tu ciudad"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gold-300 text-sm font-medium mb-2">Código postal</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 h-5 w-5" />
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full h-12 pl-12 pr-4 bg-elegant-gray border border-gold-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-300 disabled:opacity-50"
                        placeholder="28001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="elegant-card gold-border">
              <h3 className="text-xl font-semibold text-white mb-6 font-roboto">Información de la cuenta</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-elegant-gray rounded-lg">
                  <div>
                    <p className="text-sm text-gold-300">Rol</p>
                    <p className="font-medium text-white">{user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
                  </div>
                  <div className="w-3 h-3 bg-gold-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-elegant-gray rounded-lg">
                  <div>
                    <p className="text-sm text-gold-300">Miembro desde</p>
                    <p className="font-medium text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-gold-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-elegant-gray rounded-lg">
                  <div>
                    <p className="text-sm text-gold-300">Estado</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user?.isActive 
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {user?.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${user?.isActive ? 'bg-gold-400' : 'bg-red-400'}`}></div>
                </div>
              </div>
            </Card>

            <Card className="elegant-card gold-border">
              <h3 className="text-xl font-semibold text-white mb-6 font-roboto">Acciones rápidas</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar contraseña
                </Button>
                <Button variant="outline" className="w-full justify-start border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                  <Bell className="w-4 h-4 mr-2" />
                  Configuración de notificaciones
                </Button>
                <Button variant="outline" className="w-full justify-start border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-black transition-all duration-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Preferencias de privacidad
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
