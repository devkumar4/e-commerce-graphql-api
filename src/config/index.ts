// Export all configuration modules
export * from './database';
export * from './apollo';
export * from './auth';

// Server configuration 
export const serverConfig = {
  port: process.env.PORT || 4000,
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// CORS configuration
export const corsOptions = {
  // In development, allow all origins for testing
  origin: process.env.NODE_ENV === 'development' 
    ? '*' 
    : process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Application constants
export const constants = {
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // 100 requests per window
  
  // Cache settings
  CACHE_TTL: 60 * 60, // 1 hour in seconds
};