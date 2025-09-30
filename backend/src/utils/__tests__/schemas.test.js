const { userRegisterSchema, userLoginSchema, productSchema } = require('../schemas');

describe('Validation Schemas', () => {
  describe('userRegisterSchema', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const result = userRegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Email inválido');
    });

    it('should reject weak password', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: '123',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('al menos 8 caracteres');
    });

    it('should reject invalid firstName', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'J',
          lastName: 'Doe'
        }
      };

      const result = userRegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('al menos 2 caracteres');
    });

    it('should sanitize input data', () => {
      const dataWithScript = {
        body: {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John<script>alert("xss")</script>',
          lastName: 'Doe'
        }
      };

      const result = userRegisterSchema.safeParse(dataWithScript);
      expect(result.success).toBe(true);
      expect(result.data.body.firstName).toBe('John');
    });
  });

  describe('userLoginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'Password123'
        }
      };

      const result = userLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'Password123'
        }
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const validData = {
        body: {
          name: 'Test Product',
          description: 'Test description',
          price: 29.99,
          stock: 100,
          category: 'Test Category',
          images: ['image1.jpg', 'image2.jpg']
        }
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description',
          price: -10,
          stock: 100,
          category: 'Test Category'
        }
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('mayor a 0');
    });

    it('should reject negative stock', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description',
          price: 29.99,
          stock: -10,
          category: 'Test Category'
        }
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('negativo');
    });

    it('should sanitize product name', () => {
      const dataWithScript = {
        body: {
          name: 'Test Product<script>alert("xss")</script>',
          description: 'Test description',
          price: 29.99,
          stock: 100,
          category: 'Test Category'
        }
      };

      const result = productSchema.safeParse(dataWithScript);
      expect(result.success).toBe(true);
      expect(result.data.body.name).toBe('Test Product');
    });
  });
});
