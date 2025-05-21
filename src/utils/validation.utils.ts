import { RegisterInput } from '../types/user.types';
import { ProductInput } from '../types/product.types';
import { CategoryInput } from '../types/category.types';
import { OrderInput } from '../types/order.types';
import { ValidationError } from './error.utils';

export function validateRegisterInput(input: RegisterInput) {
  if (!input.email || !input.password || !input.firstName || !input.lastName) {
    throw new ValidationError('All fields are required', {});
  }
  // Add more checks as needed (email format, password strength, etc.)
}

export function validateProductInput(input: ProductInput) {
  if (!input.name || !input.description || input.price == null || input.inventory == null || !input.categoryId) {
    throw new ValidationError('All product fields are required', {});
  }
  if (input.price < 0) throw new ValidationError('Price must be positive', {});
  if (input.inventory < 0) throw new ValidationError('Inventory must be positive', {});
}

export function validateCategoryInput(input: CategoryInput) {
  if (!input.name || !input.description) {
    throw new ValidationError('All category fields are required', {});
  }
}

export function validateOrderInput(input: OrderInput) {
  if (!input.items || input.items.length === 0) {
    throw new ValidationError('Order must have at least one item', {});
  }
  for (const item of input.items) {
    if (!item.productId || item.quantity == null || item.quantity <= 0) {
      throw new ValidationError('Each order item must have a valid productId and quantity', {});
    }
  }
}
