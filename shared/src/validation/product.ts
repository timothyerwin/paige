import {Product} from '../types';

export interface ProductValidationResult {
  field: keyof Product;
  message: string;
}

export const validate = (product: Product): ProductValidationResult[] => {
  const results: ProductValidationResult[] = [];

  if (!product) {
    throw new Error('product is required');
  }

  if (product.price < 0) {
    results.push({ field: 'price', message: 'Price must be >= 0' });
  }

  const MAX_LENGTH = 55;

  const fields: Array<keyof Product> = ['type', 'description', 'color'];

  fields.forEach((field) => {
    if (!product[field]) {
      results.push({ field, message: `${field} is required` });
    } else if ((product[field] as string).length > MAX_LENGTH) {
      results.push({
        field,
        message: `${field} exceeds maximum length of ${MAX_LENGTH} characters`,
      });
    }
  });

  return results;
};
