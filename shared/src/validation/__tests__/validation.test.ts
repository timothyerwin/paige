import { validate } from '../product';

describe('Product Validation', () => {
  it('should return error messages for invalid product', () => {
    const product = {
      price: -10,
      type: '',
      description: 'This is a long description exceeding the maximum length.',
      color: 'blue',
    };

    const result = validate(product);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ field: 'price', message: 'Price must be >= 0' });
    expect(result).toContainEqual({ field: 'type', message: 'type is required' });
  });

  it('should return an empty array for valid product', () => {
    const product = {
      price: 50,
      type: 'item',
      description: 'Short description',
      color: 'red',
    };

    const result = validate(product);

    expect(result).toHaveLength(0);
  });
});
