export const APP_CONFIG = {
  name: 'Yadu Krishnan',
  title: 'Yadu Krishnan - Full Stack Developer & Digital Solutions Expert',
  description: 'Professional portfolio and business management platform for Yadu Krishnan, offering comprehensive web development, digital solutions, and creative services.',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  author: {
    name: 'Yadu Krishnan',
    email: 'hello@yadukrishnan.com',
    social: {
      linkedin: 'https://linkedin.com/in/yadukrishnan',
      github: 'https://github.com/yadukrishnan',
      twitter: 'https://twitter.com/yadukrishnan',
    },
  },
} as const;

export const ROUTES = {
  HOME: '/',
  PORTFOLIO: '/portfolio',
  CV: '/cv',
  CONTACT: '/contact',
  ADMIN: {
    DASHBOARD: '/admin',
    CLIENTS: '/admin/clients',
    PROJECTS: '/admin/projects',
    DNS: '/admin/dns',
    INVOICES: '/admin/invoices',
    SETTINGS: '/admin/settings',
  },
  CLIENT: {
    DASHBOARD: '/client',
    PROJECTS: '/client/projects',
    INVOICES: '/client/invoices',
  },
  API: {
    AUTH: '/api/auth',
    CLIENTS: '/api/clients',
    PROJECTS: '/api/projects',
    DNS: '/api/dns',
    AI: '/api/ai',
    WEBHOOKS: '/api/webhooks',
  },
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
} as const;

export const PORTFOLIO_CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'E-commerce',
  'Digital Marketing',
  'Branding',
] as const;