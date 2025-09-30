const { z } = require('zod');

// Función para sanitizar strings
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// Función para validar contraseña fuerte
const strongPassword = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede tener más de 128 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
  .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, 'La contraseña contiene caracteres no permitidos');

// Esquemas de validación para usuarios
const userRegisterSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido')
      .max(255, 'El email no puede tener más de 255 caracteres')
      .transform(sanitizeString),
    password: strongPassword,
    firstName: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede tener más de 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
      .transform(sanitizeString),
    lastName: z.string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede tener más de 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
      .transform(sanitizeString)
  })
});

const userLoginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Email inválido')
      .max(255, 'El email no puede tener más de 255 caracteres')
      .transform(sanitizeString),
    password: z.string()
      .min(1, 'La contraseña es requerida')
      .max(128, 'La contraseña no puede tener más de 128 caracteres')
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
    name: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede tener más de 100 caracteres')
      .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/, 'El nombre contiene caracteres no permitidos')
      .transform(sanitizeString),
    description: z.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede tener más de 2000 caracteres')
      .transform(sanitizeString),
    price: z.number()
      .positive('El precio debe ser positivo')
      .max(999999.99, 'El precio no puede ser mayor a 999,999.99')
      .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),
    stock: z.number()
      .int('El stock debe ser un número entero')
      .min(0, 'El stock debe ser un número entero no negativo')
      .max(99999, 'El stock no puede ser mayor a 99,999'),
    categoryId: z.string().cuid('ID de categoría inválido'),
    images: z.array(z.string().url('URL de imagen inválida'))
      .max(10, 'No se pueden subir más de 10 imágenes')
      .optional()
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


