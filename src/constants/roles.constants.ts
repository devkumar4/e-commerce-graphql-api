export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
