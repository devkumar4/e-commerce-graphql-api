// Authentication configuration

// JWT configuration options
export const jwtConfig = {
  // Secret key from environment variables
  secret: process.env.JWT_SECRET || 'default-development-only-secret',
  
  // Token expiration settings
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Algorithm used for signing
  algorithm: 'HS256' as const,
  
  // Token issuer
  issuer: 'e-commerce-api',
};

// Password hashing configuration
export const passwordHashConfig = {
  // Number of salt rounds for bcrypt
  saltRounds: 10,
};

// Role-based access control
export const roles = {
  // Admin role can perform all operations
  ADMIN: 'ADMIN',
  
  // Customer role has limited permissions
  CUSTOMER: 'CUSTOMER',
};

// Permission checks for operations
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

// Check if user has required permission
export const hasPermission = (
  userRole: string | undefined,
  requiredRoles: string[]
): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};