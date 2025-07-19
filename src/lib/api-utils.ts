import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  type ApiResponse 
} from '@/types';

// API Response helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function createErrorResponse(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const message = typeof error === 'string' ? error : error.message;
  
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

// Error handler wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return createErrorResponse(
          `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
          400
        );
      }

      // Handle custom application errors
      if (error instanceof ValidationError) {
        return createErrorResponse(error.message, 400);
      }

      if (error instanceof AuthenticationError) {
        return createErrorResponse(error.message, 401);
      }

      if (error instanceof AuthorizationError) {
        return createErrorResponse(error.message, 403);
      }

      if (error instanceof NotFoundError) {
        return createErrorResponse(error.message, 404);
      }

      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.statusCode);
      }

      // Handle unknown errors
      return createErrorResponse(
        process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  };
}

// Request validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request data');
    }
    throw new ValidationError('Failed to parse request body');
  }
}

// Query parameter validation helper
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: any
): T {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

// Method validation helper
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(request.method)) {
    throw new AppError(
      `Method ${request.method} not allowed`,
      405
    );
  }
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Get client IP helper
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// CORS helper
export function setCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  
  return response;
}

// Pagination helper
export function createPaginationResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Search helper
export function buildSearchQuery(
  query: string,
  fields: string[]
): any {
  if (!query.trim()) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: query,
        mode: 'insensitive',
      },
    })),
  };
}

// Sort helper
export function buildSortQuery(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): any {
  if (!sortBy) return { createdAt: 'desc' };
  
  return { [sortBy]: sortOrder };
}