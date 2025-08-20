# E-commerce Moderno

Un e-commerce completo construido con React, Node.js, PostgreSQL y Prisma.

## 🚀 Características

- **Frontend**: React + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express + JWT
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT con roles (cliente y administrador)
- **Pagos**: Integración con Stripe (opcional)

## 📋 Funcionalidades

- ✅ Registro e inicio de sesión de usuarios
- ✅ Roles: cliente y administrador
- ✅ Catálogo de productos (CRUD completo)
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout
- ✅ Historial de pedidos
- ✅ Panel de administración
- ✅ Búsqueda y filtrado de productos

## 🛠️ Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd ecommerce-moderno
```

### 2. Configurar la base de datos

```bash
# Crear base de datos PostgreSQL
createdb ecommerce_db

# O usar el script SQL proporcionado
psql -U postgres -f docs/database.sql
```

### 3. Configurar variables de entorno

```bash
# Backend
cd backend
cp env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Frontend
cd ../frontend
cp env.example .env
# Editar .env con la URL de la API
```

### 4. Instalar dependencias y configurar

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Frontend
cd ../frontend
npm install
```

### 5. Ejecutar el proyecto

```bash
# Terminal 1 - Backend (puerto 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 3000)
cd frontend
npm run dev
```

### 6. Verificar la instalación

- Backend API: http://localhost:5000/health
- Frontend: http://localhost:3000
- Documentación API: http://localhost:5000/api-docs

### 7. Datos de prueba

El seed crea automáticamente:
- **Admin**: admin@ecommerce.com / admin123
- **Cliente**: cliente@ecommerce.com / client123

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api-docs

## 📁 Estructura del Proyecto

```
ecommerce-moderno/
├── backend/                 # API REST con Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Controladores de la API
│   │   ├── middleware/      # Middlewares personalizados
│   │   ├── models/          # Modelos de Prisma
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── prisma/              # Configuración de Prisma
│   └── tests/               # Tests unitarios
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios de API
│   │   ├── store/           # Estado global
│   │   └── utils/           # Utilidades
│   └── public/              # Archivos estáticos
└── docs/                    # Documentación adicional
```

## 🧪 Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Despliegue

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Conectar con Vercel y desplegar
```

### Backend (Render)
```bash
cd backend
# Configurar variables de entorno en Render
# Conectar repositorio y desplegar
```

## 📝 Scripts SQL

Ver `docs/database.sql` para el script de creación inicial de la base de datos.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.
