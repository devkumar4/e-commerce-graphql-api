import { validateCategoryInput } from '../../../src/utils/validation.utils';
import { ValidationError } from '../../../src/utils/error.utils';

describe('validateCategoryInput', () => {
  it('throws error if name is missing', () => {
    expect(() => validateCategoryInput({ name: '', description: 'desc' }))
      .toThrow(ValidationError);
  });

  it('throws error if description is missing', () => {
    expect(() => validateCategoryInput({ name: 'Cat', description: '' }))
      .toThrow(ValidationError);
  });

  it('passes for valid input', () => {
    expect(() => validateCategoryInput({ name: 'Cat', description: 'desc' }))
      .not.toThrow();
  });
});
