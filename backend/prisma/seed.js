const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear categorías
  console.log('📂 Creando categorías...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electrónicos' },
      update: {},
      create: {
        name: 'Electrónicos',
        description: 'Productos electrónicos y tecnología'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Ropa' },
      update: {},
      create: {
        name: 'Ropa',
        description: 'Ropa y accesorios de moda'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Hogar' },
      update: {},
      create: {
        name: 'Hogar',
        description: 'Productos para el hogar y decoración'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Deportes' },
      update: {},
      create: {
        name: 'Deportes',
        description: 'Equipamiento y ropa deportiva'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Libros' },
      update: {},
      create: {
        name: 'Libros',
        description: 'Libros y material educativo'
      }
    })
  ]);

  console.log(`✅ ${categories.length} categorías creadas`);

  // Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN'
    }
  });

  console.log('✅ Usuario administrador creado');

  // Crear usuario cliente de ejemplo
  console.log('👤 Creando usuario cliente...');
  const clientPassword = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@ecommerce.com' },
    update: {},
    create: {
      email: 'cliente@ecommerce.com',
      password: clientPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'CLIENT'
    }
  });

  console.log('✅ Usuario cliente creado');

  // Crear productos de ejemplo
  console.log('📦 Creando productos...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { name: 'iPhone 15 Pro' },
      update: {},
      create: {
        name: 'iPhone 15 Pro',
        description: 'El último iPhone con características avanzadas, cámara profesional y rendimiento excepcional.',
        price: 999.99,
        stock: 50,
        categoryId: categories[0].id, // Electrónicos
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'MacBook Air M2' },
      update: {},
      create: {
        name: 'MacBook Air M2',
        description: 'Laptop ultraligera con chip M2, perfecta para trabajo y creatividad.',
        price: 1199.99,
        stock: 30,
        categoryId: categories[0].id, // Electrónicos
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'Camiseta Básica' },
      update: {},
      create: {
        name: 'Camiseta Básica',
        description: 'Camiseta de algodón 100% orgánico, cómoda y duradera.',
        price: 29.99,
        stock: 100,
        categoryId: categories[1].id, // Ropa
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'Jeans Clásicos' },
      update: {},
      create: {
        name: 'Jeans Clásicos',
        description: 'Jeans de alta calidad con ajuste perfecto y durabilidad excepcional.',
        price: 79.99,
        stock: 75,
        categoryId: categories[1].id, // Ropa
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'Lámpara de Mesa' },
      update: {},
      create: {
        name: 'Lámpara de Mesa',
        description: 'Lámpara LED moderna con diseño minimalista, perfecta para escritorio.',
        price: 89.99,
        stock: 40,
        categoryId: categories[2].id, // Hogar
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'Pelota de Fútbol' },
      update: {},
      create: {
        name: 'Pelota de Fútbol',
        description: 'Pelota oficial de competición con tecnología avanzada para máximo rendimiento.',
        price: 49.99,
        stock: 60,
        categoryId: categories[3].id, // Deportes
        images: [
          'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
          'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'El Señor de los Anillos' },
      update: {},
      create: {
        name: 'El Señor de los Anillos',
        description: 'Trilogía completa de J.R.R. Tolkien en edición de lujo con ilustraciones.',
        price: 39.99,
        stock: 25,
        categoryId: categories[4].id, // Libros
        images: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
        ]
      }
    }),
    prisma.product.upsert({
      where: { name: 'Auriculares Inalámbricos' },
      update: {},
      create: {
        name: 'Auriculares Inalámbricos',
        description: 'Auriculares con cancelación de ruido activa y batería de larga duración.',
        price: 199.99,
        stock: 35,
        categoryId: categories[0].id, // Electrónicos
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        ]
      }
    })
  ]);

  console.log(`✅ ${products.length} productos creados`);

  // Crear algunas reseñas de ejemplo
  console.log('⭐ Creando reseñas...');
  const reviews = await Promise.all([
    prisma.review.upsert({
      where: {
        userId_productId: {
          userId: client.id,
          productId: products[0].id
        }
      },
      update: {},
      create: {
        userId: client.id,
        productId: products[0].id,
        rating: 5,
        comment: 'Excelente producto, muy rápido y la cámara es increíble.'
      }
    }),
    prisma.review.upsert({
      where: {
        userId_productId: {
          userId: client.id,
          productId: products[2].id
        }
      },
      update: {},
      create: {
        userId: client.id,
        productId: products[2].id,
        rating: 4,
        comment: 'Muy cómoda y de buena calidad. Recomendada.'
      }
    })
  ]);

  console.log(`✅ ${reviews.length} reseñas creadas`);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Datos de acceso:');
  console.log('👤 Admin: admin@ecommerce.com / admin123');
  console.log('👤 Cliente: cliente@ecommerce.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
