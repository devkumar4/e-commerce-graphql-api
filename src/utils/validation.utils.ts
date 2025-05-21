import { RegisterInput } from '../types/user.types';
import { ProductInput } from '../types/product.types';
import { CategoryInput } from '../types/category.types';
import { OrderInput } from '../types/order.types';
import { ValidationError } from './error.utils';
import { z, ZodError } from 'zod';


// RegisterInput schema
const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
});

export function validateRegisterInput(input: RegisterInput) {
  try {
    registerSchema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      const fields = Object.fromEntries(err.errors.map(e => [e.path[0] as string, e.message]));
      throw new ValidationError('Invalid register input', fields);
    }
    throw err;
  }
}

// ProductInput schema
const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.number().nonnegative({ message: 'Price must be positive' }),
  inventory: z.number().nonnegative({ message: 'Inventory must be positive' }),
  categoryId: z.string().min(1, { message: 'CategoryId is required' }),
});

export function validateProductInput(input: ProductInput) {
  try {
    productSchema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      const fields = Object.fromEntries(err.errors.map(e => [e.path[0] as string, e.message]));
      throw new ValidationError('Invalid product input', fields);
    }
    throw err;
  }
}

// CategoryInput schema
const categorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
});

export function validateCategoryInput(input: CategoryInput) {
  try {
    categorySchema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      const fields = Object.fromEntries(err.errors.map(e => [e.path[0] as string, e.message]));
      throw new ValidationError('Invalid category input', fields);
    }
    throw err;
  }
}

// OrderItem schema
const orderItemSchema = z.object({
  productId: z.string().min(1, { message: 'ProductId is required' }),
  quantity: z.number().positive({ message: 'Quantity must be greater than zero' }),
});

// OrderInput schema
const orderSchema = z.object({
  items: z.array(orderItemSchema).nonempty({ message: 'Order must have at least one item' }),
});

export function validateOrderInput(input: OrderInput) {
  try {
    orderSchema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      const fields = Object.fromEntries(err.errors.map(e => [e.path.join('.'), e.message]));
      throw new ValidationError('Invalid order input', fields);
    }
    throw err;
  }
}
