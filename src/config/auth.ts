// Authentication-related configuration and role-based access control

// JWT options — secret from env, expiry, algorithm, and issuer
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-development-only-secret', // fallback for dev only
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256' as const,
  issuer: 'e-commerce-api',
};

// Password hashing using bcrypt salt rounds
export const passwordHashConfig = {
  saltRounds: 10,
};

// Defined user roles with escalating privileges
export const roles = {
  ADMIN: 'ADMIN',     // Full control
  CUSTOMER: 'CUSTOMER', // Restricted permissions
};

// Operation-level permissions mapped to roles
export const permissions = {
  products: {
    create: [roles.ADMIN],
    update: [roles.ADMIN],
    delete: [roles.ADMIN],
    read: [roles.ADMIN, roles.CUSTOMER],
  },
  categories: {
    create: [roles.ADMIN],
    update: [roles.ADMIN],
    delete: [roles.ADMIN],
    read: [roles.ADMIN, roles.CUSTOMER],
  },
  orders: {
    create: [roles.CUSTOMER],
    update: [roles.ADMIN],
    updateStatus: [roles.ADMIN],
    readAll: [roles.ADMIN],
    readOwn: [roles.CUSTOMER],
  },
  users: {
    readAll: [roles.ADMIN],
    readOwn: [roles.CUSTOMER, roles.ADMIN],
    update: [roles.ADMIN],
    updateOwn: [roles.CUSTOMER, roles.ADMIN],
    delete: [roles.ADMIN],
  },
};

// Utility to check if a user's role grants the required permission
export const hasPermission = (
  userRole: string | undefined,
  requiredRoles: string[]
): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};
