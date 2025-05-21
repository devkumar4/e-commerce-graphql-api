// Example unit test for a product service function

import * as productService from '../../../src/services/product.service';

describe('productService', () => {
  it('should throw if price is negative', () => {
    expect(() =>
      productService.validateProductInput({
        name: 'Test',
        description: 'desc',
        price: -1,
        inventory: 1,
        categoryId: 'catid'
      })
    ).toThrow();
  });

  it('should pass for valid input', () => {
    expect(() =>
      productService.validateProductInput({
        name: 'Test',
        description: 'desc',
        price: 10,
        inventory: 1,
        categoryId: 'catid'
      })
    ).not.toThrow();
  });
});
