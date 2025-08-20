const { z } = require('zod');

// Esquemas de validación para usuarios
const userRegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres')
  })
});

const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
  })
});

const userUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').optional(),
    email: z.string().email('Email inválido').optional()
  })
});

// Esquemas de validación para productos
const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    price: z.number().positive('El precio debe ser positivo'),
    stock: z.number().int().min(0, 'El stock debe ser un número entero no negativo'),
    categoryId: z.string().cuid('ID de categoría inválido'),
    images: z.array(z.string().url('URL de imagen inválida')).optional()
  })
});

const productUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
    price: z.number().positive('El precio debe ser positivo').optional(),
    stock: z.number().int().min(0, 'El stock debe ser un número entero no negativo').optional(),
    categoryId: z.string().cuid('ID de categoría inválido').optional(),
    images: z.array(z.string().url('URL de imagen inválida')).optional(),
    isActive: z.boolean().optional()
  })
});

const productIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de producto inválido')
  })
});

// Esquemas de validación para categorías
const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    image: z.string().url('URL de imagen inválida').optional()
  })
});

const categoryUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    description: z.string().optional(),
    image: z.string().url('URL de imagen inválida').optional(),
    isActive: z.boolean().optional()
  })
});

const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de categoría inválido')
  })
});

// Esquemas de validación para carrito
const cartItemSchema = z.object({
  body: z.object({
    productId: z.string().cuid('ID de producto inválido'),
    quantity: z.number().int().positive('La cantidad debe ser un número entero positivo')
  })
});

const cartItemUpdateSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('La cantidad debe ser un número entero positivo')
  })
});

const cartItemIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de item del carrito inválido')
  })
});

// Esquemas de validación para pedidos
const orderCreateSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
      city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
      state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
      zipCode: z.string().min(4, 'El código postal debe tener al menos 4 caracteres'),
      country: z.string().min(2, 'El país debe tener al menos 2 caracteres')
    }),
    paymentMethod: z.enum(['card', 'paypal', 'cash'], {
      errorMap: () => ({ message: 'Método de pago inválido' })
    })
  })
});

const orderIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de pedido inválido')
  })
});

const orderStatusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Estado de pedido inválido' })
    })
  })
});

// Esquemas de validación para reseñas
const reviewCreateSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'La calificación debe ser entre 1 y 5').max(5, 'La calificación debe ser entre 1 y 5'),
    comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').optional()
  })
});

const reviewUpdateSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'La calificación debe ser entre 1 y 5').max(5, 'La calificación debe ser entre 1 y 5').optional(),
    comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').optional()
  })
});

const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de reseña inválido')
  })
});

// Esquemas de validación para búsqueda y filtros
const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().cuid('ID de categoría inválido').optional(),
    minPrice: z.number().positive('Precio mínimo debe ser positivo').optional(),
    maxPrice: z.number().positive('Precio máximo debe ser positivo').optional(),
    sortBy: z.enum(['name', 'price', 'createdAt'], {
      errorMap: () => ({ message: 'Campo de ordenamiento inválido' })
    }).optional(),
    sortOrder: z.enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'Orden inválido' })
    }).optional()
  })
});

// Esquemas de validación para paginación
const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Página debe ser un número').optional(),
    limit: z.string().regex(/^\d+$/, 'Límite debe ser un número').optional()
  })
});

module.exports = {
  // Usuarios
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  
  // Productos
  productCreateSchema,
  productUpdateSchema,
  productIdSchema,
  
  // Categorías
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  
  // Carrito
  cartItemSchema,
  cartItemUpdateSchema,
  cartItemIdSchema,
  
  // Pedidos
  orderCreateSchema,
  orderIdSchema,
  orderStatusUpdateSchema,
  
  // Reseñas
  reviewCreateSchema,
  reviewUpdateSchema,
  reviewIdSchema,
  
  // Búsqueda y paginación
  searchSchema,
  paginationSchema
};


