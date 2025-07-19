import { z } from 'zod';
import { ClientStatus, ProjectStatus, Priority, DNSType } from '@/types';

// Client validation schemas
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100, 'Company name too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  status: z.nativeEnum(ClientStatus).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().cuid('Invalid client ID'),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  startDate: z.coerce.date(),
  deadline: z.coerce.date().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  clientId: z.string().cuid('Invalid client ID').optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  projectId: z.string().cuid('Invalid project ID'),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  projectId: z.string().cuid('Invalid project ID').optional(),
});

// DNS Record validation schemas
export const createDNSRecordSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  type: z.nativeEnum(DNSType),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  ttl: z.number().int().min(1).max(86400).optional(),
  priority: z.number().int().min(0).max(65535).optional(),
});

export const updateDNSRecordSchema = createDNSRecordSchema.partial();

// Portfolio Item validation schemas
export const createPortfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  images: z.array(z.string().url('Invalid image URL')),
  liveUrl: z.string().url('Invalid URL').optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const updatePortfolioItemSchema = createPortfolioItemSchema.partial();

// AI Content validation schemas
export const aiGenerateContentSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  type: z.enum(['caption', 'email', 'content']),
  context: z.string().max(2000, 'Context too long').optional(),
});

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  sessionId: z.string().optional(),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().positive('File size must be positive'),
});

// Email validation schemas
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Type exports for use in components
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateDNSRecordInput = z.infer<typeof createDNSRecordSchema>;
export type UpdateDNSRecordInput = z.infer<typeof updateDNSRecordSchema>;
export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>;
export type UpdatePortfolioItemInput = z.infer<typeof updatePortfolioItemSchema>;
export type AIGenerateContentInput = z.infer<typeof aiGenerateContentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;