import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// Mock the database
jest.mock('@/lib/db')
const mockDb = db as jest.Mocked<typeof db>

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock environment variables
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
    process.env.NEXTAUTH_SECRET = 'test-secret'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
  })

  it('returns healthy status when all checks pass', async () => {
    // Mock successful database query
    mockDb.$queryRaw.mockResolvedValue([{ result: 1 }])
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database.ok).toBe(true)
    expect(data.checks.environment.ok).toBe(true)
  })

  it('returns unhealthy status when database check fails', async () => {
    // Mock database error
    mockDb.$queryRaw.mockRejectedValue(new Error('Connection failed'))
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database.ok).toBe(false)
    expect(data.checks.database.error).toBe('Connection failed')
  })

  it('returns unhealthy status when environment variables are missing', async () => {
    // Remove required environment variable
    delete process.env.DATABASE_URL
    
    // Mock successful database query
    mockDb.$queryRaw.mockResolvedValue([{ result: 1 }])
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.environment.ok).toBe(false)
    expect(data.checks.environment.missing).toContain('DATABASE_URL')
  })

  it('includes uptime and version information', async () => {
    // Mock successful database query
    mockDb.$queryRaw.mockResolvedValue([{ result: 1 }])
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.uptime).toBeGreaterThan(0)
    expect(data.version).toBeDefined()
    expect(data.timestamp).toBeDefined()
  })

  it('handles unexpected errors gracefully', async () => {
    // Mock database to throw unexpected error
    mockDb.$queryRaw.mockImplementation(() => {
      throw new Error('Unexpected error')
    })
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data.status).toBe('error')
    expect(data.error).toBe('Health check failed')
  })
})