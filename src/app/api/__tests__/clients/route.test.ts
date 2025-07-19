import { GET, POST } from '@/app/api/clients/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { mockSession, mockClientSession } from '@/lib/test-utils'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/db')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockDb = db as jest.Mocked<typeof db>

describe('/api/clients', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/clients', () => {
    it('returns clients for authenticated admin', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockDb.client.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Test Client',
          email: 'test@example.com',
          company: 'Test Company',
          phone: '123-456-7890',
          address: '123 Test St',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: null,
        },
      ])

      const request = new NextRequest('http://localhost:3000/api/clients')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Test Client')
    })

    it('returns 401 for unauthenticated users', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('returns 403 for non-admin users', async () => {
      mockGetServerSession.mockResolvedValue(mockClientSession)

      const request = new NextRequest('http://localhost:3000/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(403)
    })

    it('handles database errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockDb.client.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/clients', () => {
    const validClientData = {
      name: 'New Client',
      email: 'new@example.com',
      company: 'New Company',
      phone: '987-654-3210',
      address: '456 New St',
      status: 'PROSPECT',
    }

    it('creates client for authenticated admin', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockDb.client.create.mockResolvedValue({
        id: '2',
        ...validClientData,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: null,
      })

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(validClientData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('New Client')
      expect(mockDb.client.create).toHaveBeenCalledWith({
        data: validClientData,
      })
    })

    it('returns 401 for unauthenticated users', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(validClientData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('returns 400 for invalid data', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)

      const invalidData = { name: '' } // Missing required fields

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('handles duplicate email errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      mockDb.client.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      })

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(validClientData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('email')
    })
  })
})