export const validateProduct = (product: any) => {
  if (!product.name) {
    throw new Error("Product name is required");
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    throw new Error("Product price must be a positive number");
  }
  return true;
};
