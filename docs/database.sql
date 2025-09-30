-- Script SQL para crear la base de datos del E-commerce
-- Ejecutar este script en PostgreSQL antes de usar Prisma

-- Crear la base de datos
CREATE DATABASE ecommerce_db;

-- Conectar a la base de datos
\c ecommerce_db;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear esquema público (por defecto)
CREATE SCHEMA IF NOT EXISTS public;

-- Comentarios sobre las tablas que se crearán automáticamente con Prisma
-- Las siguientes tablas se crearán automáticamente cuando ejecutes:
-- npx prisma migrate dev

/*
TABLAS QUE SE CREARÁN:

1. users - Usuarios del sistema (clientes y administradores)
2. categories - Categorías de productos
3. products - Productos del catálogo
4. cart_items - Items en el carrito de compras
5. orders - Pedidos realizados
6. order_items - Items de cada pedido
7. reviews - Reseñas de productos

ENUMS QUE SE CREARÁN:
1. UserRole - CLIENT, ADMIN
2. OrderStatus - PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
3. PaymentStatus - PENDING, COMPLETED, FAILED, REFUNDED
*/

-- Instrucciones para configurar la base de datos:

/*
1. Instalar PostgreSQL si no lo tienes instalado
2. Crear la base de datos ejecutando este script
3. Configurar las variables de entorno en backend/.env
4. Ejecutar las migraciones de Prisma:
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed

Variables de entorno necesarias en backend/.env:
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
*/

-- Verificar que la base de datos se creó correctamente
SELECT current_database() as database_name;
SELECT version() as postgres_version;
