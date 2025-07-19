import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test.describe('Public API Endpoints', () => {
    test('should return health check', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/health`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeTruthy();
    });

    test('should handle portfolio API', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/portfolio`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should handle contact form submission', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/contact`, {
        data: {
          name: 'E2E Test User',
          email: 'e2e@test.com',
          message: 'This is a test message from E2E tests',
        },
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should handle chat API with rate limiting', async ({ request }) => {
      // Test normal chat request
      const response = await request.post(`${baseURL}/api/chat`, {
        data: {
          message: 'Hello, this is a test message',
          sessionId: 'test-session-' + Date.now(),
        },
      });
      
      expect(response.status()).toBe(200);
      
      // Test rate limiting by making multiple requests
      const promises = [];
      for (let i = 0; i < 12; i++) {
        promises.push(
          request.post(`${baseURL}/api/chat`, {
            data: {
              message: `Rate limit test message ${i}`,
              sessionId: 'rate-limit-test-' + Date.now(),
            },
          })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // At least one should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Protected API Endpoints', () => {
    test('should require authentication for admin endpoints', async ({ request }) => {
      const adminEndpoints = [
        '/api/admin/clients',
        '/api/admin/projects',
        '/api/admin/dns',
        '/api/admin/workflows',
        '/api/admin/monitoring',
      ];
      
      for (const endpoint of adminEndpoints) {
        const response = await request.get(`${baseURL}${endpoint}`);
        
        // Should return 401 Unauthorized or 302 Redirect
        expect([401, 302]).toContain(response.status());
      }
    });

    test('should require authentication for client endpoints', async ({ request }) => {
      const clientEndpoints = [
        '/api/client/projects',
        '/api/client/invoices',
        '/api/client/profile',
      ];
      
      for (const endpoint of clientEndpoints) {
        const response = await request.get(`${baseURL}${endpoint}`);
        
        // Should return 401 Unauthorized or 302 Redirect
        expect([401, 302]).toContain(response.status());
      }
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle invalid JSON in POST requests', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/contact`, {
        data: 'invalid json string',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      expect(response.status()).toBe(400);
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/contact`, {
        data: {
          name: 'Test User',
          // Missing email and message
        },
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeTruthy();
    });

    test('should handle non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/non-existent-endpoint`);
      
      expect(response.status()).toBe(404);
    });

    test('should handle method not allowed', async ({ request }) => {
      // Try POST on a GET-only endpoint
      const response = await request.post(`${baseURL}/api/portfolio`);
      
      expect(response.status()).toBe(405);
    });
  });

  test.describe('API Performance', () => {
    test('should respond within acceptable time limits', async ({ request }) => {
      const endpoints = [
        '/api/health',
        '/api/portfolio',
      ];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(`${baseURL}${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      }
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = [];
      
      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(request.get(`${baseURL}/api/health`));
      }
      
      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.describe('API Security', () => {
    test('should include security headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/health`);
      
      const headers = response.headers();
      
      // Check for security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeTruthy();
      expect(headers['x-xss-protection']).toBeTruthy();
    });

    test('should prevent SQL injection attempts', async ({ request }) => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --",
      ];
      
      for (const input of maliciousInputs) {
        const response = await request.post(`${baseURL}/api/contact`, {
          data: {
            name: input,
            email: 'test@example.com',
            message: 'Test message',
          },
        });
        
        // Should either reject the input or sanitize it
        // The exact response depends on validation implementation
        expect([200, 400]).toContain(response.status());
      }
    });

    test('should prevent XSS attempts', async ({ request }) => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>',
      ];
      
      for (const payload of xssPayloads) {
        const response = await request.post(`${baseURL}/api/contact`, {
          data: {
            name: 'Test User',
            email: 'test@example.com',
            message: payload,
          },
        });
        
        // Should either reject or sanitize the input
        expect([200, 400]).toContain(response.status());
        
        if (response.status() === 200) {
          const data = await response.json();
          // Response should not contain the raw script
          expect(JSON.stringify(data)).not.toContain('<script>');
        }
      }
    });

    test('should handle CORS properly', async ({ request }) => {
      const response = await request.options(`${baseURL}/api/health`, {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'GET',
        },
      });
      
      const corsHeader = response.headers()['access-control-allow-origin'];
      
      // Should not allow arbitrary origins
      expect(corsHeader).not.toBe('*');
    });
  });

  test.describe('API Documentation', () => {
    test('should provide API documentation', async ({ request }) => {
      // Check if API documentation endpoint exists
      const response = await request.get(`${baseURL}/api/docs`);
      
      // Documentation might be at different endpoint or might not exist
      // This is more of a suggestion for future implementation
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('text/html');
      }
    });
  });
});