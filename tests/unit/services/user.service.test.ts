// Example unit test for a user service function

import * as userService from '../../../src/services/user.service';

describe('userService', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await userService.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
  });

  it('should validate password correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await userService.hashPassword(password);
    const isValid = await userService.comparePassword(password, hash);
    expect(isValid).toBe(true);
    const isInvalid = await userService.comparePassword('wrong', hash);
    expect(isInvalid).toBe(false);
  });
});
