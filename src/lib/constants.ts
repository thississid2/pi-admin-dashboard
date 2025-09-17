// Application constants and configuration

export const APP_CONFIG = {
  name: 'Pi Admin Dashboard',
  version: '0.1.0',
  description: 'Internal admin dashboard for merchant onboarding management',
  company: 'PayIntelligence',
  supportEmail: 'support@payintelligence.com',
} as const;

export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const UI_CONFIG = {
  sidebarWidth: '14rem', // 56 in Tailwind (w-56)
  headerHeight: '4rem',
  maxToastDuration: 5000,
  tablePageSize: 10,
  searchDebounceMs: 300,
} as const;

export const THEME_CONFIG = {
  colors: {
    primary: '#1ABC9C',
    primaryDark: '#16A085',
    secondary: '#2C3E50',
    accent: '#34495E',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },
  borderRadius: {
    small: '0.375rem',
    medium: '0.5rem',
    large: '0.75rem',
  },
} as const;

export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  email: {
    maxLength: 255,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
} as const;

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes
  DASHBOARD: '/',
  APPLICATIONS: '/applications',
  ADMIN_USERS: '/admin-users',
  USER_MANAGEMENT: '/user-management',
  API_DOCUMENTATION: '/api-documentation',
  CHECKOUT_DESIGNS: '/checkout-designs',
  API_INTEGRATIONS: '/api-integrations',
  COMMUNICATIONS: '/communications',
  RISK_MANAGEMENT: '/risk-management',
  PI_SYMPHONY: '/pi-symphony',
  PI_SHIELD: '/pi-shield',
  SETTINGS: '/settings',
  WEBSITE_CHECKER: '/website-checker',
  
  // Dynamic routes
  MERCHANT_DETAIL: (id: string) => `/merchants/${id}`,
  USER_EDIT: (id: string) => `/user-management/edit/${id}`,
} as const;

export const STATUS_COLORS = {
  approved: 'text-green-700 bg-green-100',
  pending: 'text-yellow-700 bg-yellow-100',
  under_review: 'text-blue-700 bg-blue-100',
  rejected: 'text-red-700 bg-red-100',
  active: 'text-green-700 bg-green-100',
  inactive: 'text-gray-700 bg-gray-100',
  suspended: 'text-red-700 bg-red-100',
  pending_activation: 'text-yellow-700 bg-yellow-100',
} as const;

export const DATE_FORMATS = {
  display: 'MM/dd/yyyy',
  iso: 'yyyy-MM-dd',
  timestamp: 'MM/dd/yyyy HH:mm:ss',
} as const;