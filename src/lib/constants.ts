// Application constants
export const APP_NAME = 'Yadu Krishnan';
export const APP_DESCRIPTION = 'Full-Stack Developer & Digital Solutions Expert';
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// API Configuration
export const API_ROUTES = {
  CLIENTS: '/api/clients',
  PROJECTS: '/api/projects',
  TASKS: '/api/tasks',
  INVOICES: '/api/invoices',
  PORTFOLIO: '/api/portfolio',
  DNS: '/api/dns',
  AI: '/api/ai',
  CHAT: '/api/chat',
  UPLOAD: '/api/upload',
  CONTACT: '/api/contact',
} as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Rate limiting
export const RATE_LIMITS = {
  API_DEFAULT: 100, // requests per minute
  CHAT: 10, // requests per minute
  UPLOAD: 5, // requests per minute
  CONTACT: 3, // requests per minute
} as const;

// Project status colors
export const PROJECT_STATUS_COLORS = {
  PLANNING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-gray-100 text-gray-800',
} as const;

// Task status colors
export const TASK_STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
} as const;

// Client status colors
export const CLIENT_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PROSPECT: 'bg-blue-100 text-blue-800',
} as const;

// DNS record type colors
export const DNS_TYPE_COLORS = {
  A: 'bg-blue-100 text-blue-800',
  AAAA: 'bg-purple-100 text-purple-800',
  CNAME: 'bg-green-100 text-green-800',
  MX: 'bg-orange-100 text-orange-800',
  TXT: 'bg-gray-100 text-gray-800',
  NS: 'bg-red-100 text-red-800',
} as const;

// DNS status colors
export const DNS_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
} as const;

// Invoice status colors
export const INVOICE_STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
} as const;

// Portfolio categories
export const PORTFOLIO_CATEGORIES = [
  'Web Development',
  'Mobile App',
  'E-commerce',
  'SaaS',
  'API Development',
  'DevOps',
  'UI/UX Design',
  'Consulting',
] as const;

// Common tags for portfolio items
export const COMMON_TAGS = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'Tailwind CSS',
  'Prisma',
  'Stripe',
  'Authentication',
  'Real-time',
  'AI/ML',
] as const;

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  INVOICE: 'invoice',
  PROJECT_UPDATE: 'project-update',
  PASSWORD_RESET: 'password-reset',
  CONTACT_FORM: 'contact-form',
} as const;

// Social media links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/yadukrishnan',
  LINKEDIN: 'https://linkedin.com/in/yadukrishnan',
  TWITTER: 'https://twitter.com/yadukrishnan',
  EMAIL: 'hello@yadukrishnan.dev',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'CV', href: '/cv' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
] as const;

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Clients', href: '/admin/clients', icon: 'Users' },
  { name: 'Projects', href: '/admin/projects', icon: 'FolderOpen' },
  { name: 'Invoices', href: '/admin/invoices', icon: 'Receipt' },
  { name: 'Portfolio', href: '/admin/portfolio', icon: 'Image' },
  { name: 'CV', href: '/admin/cv', icon: 'FileText' },
  { name: 'DNS', href: '/admin/dns', icon: 'Globe' },
  { name: 'Email', href: '/admin/email', icon: 'Mail' },
  { name: 'AI Tools', href: '/admin/ai', icon: 'Sparkles' },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;