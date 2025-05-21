// Example unit test for a user service function
import { comparePassword, hashPassword } from '../../../src/utils/password.utils';

describe('userService', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
  });

  it('should validate password correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
    const isInvalid = await comparePassword('wrong', hash);
    expect(isInvalid).toBe(false);
  });
});
