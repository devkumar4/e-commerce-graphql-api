export function validateProductInput(input: {
  name: string;
  description: string;
  price: number;
  inventory: number;
  categoryId: string;
}) {
  if (!input.name || !input.description || input.price == null || input.inventory == null || !input.categoryId) {
    throw new Error('All product fields are required');
  }
  if (input.price < 0) throw new Error('Price must be positive');
  if (input.inventory < 0) throw new Error('Inventory must be positive');
}

// ...add other product-related service functions as needed...
