import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      sismember: vi.fn(),
      sadd: vi.fn(),
      hset: vi.fn(),
      scard: vi.fn(),
    })),
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

vi.mock('@arcjet/next', () => ({
  default: vi.fn(() => ({
    protect: vi.fn(),
  })),
  validateEmail: vi.fn(),
}));

describe('Waitlist API Route', () => {
  let mockRedis: any;
  let mockResend: any;
  let mockArcjet: any;

  beforeEach(() => {
    // Reset environment variables
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.ARCJET_KEY = 'test-arcjet-key';
    process.env.ADMIN_EMAIL = 'admin@test.com';

    // Get mock instances
    const { Redis } = require('@upstash/redis');
    const { Resend } = require('resend');
    const arcjet = require('@arcjet/next').default;

    mockRedis = Redis.fromEnv();
    mockResend = new Resend();
    mockArcjet = arcjet();

    // Setup default mock behaviors
    mockRedis.sismember.mockResolvedValue(0); // Email doesn't exist
    mockRedis.sadd.mockResolvedValue(1);
    mockRedis.hset.mockResolvedValue('OK');
    mockRedis.scard.mockResolvedValue(42);

    mockResend.emails.send.mockResolvedValue({ id: 'test-email-id' });

    mockArcjet.protect.mockResolvedValue({
      isDenied: () => false,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('POST endpoint - Valid Name Submissions', () => {
    it('should accept valid name with email', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'John Doe' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(42);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: 'John Doe' })
      );
    });

    it('should accept email without name', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled(); // No name to store
    });

    it('should trim whitespace from valid names', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '  Jane Smith  ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: 'Jane Smith' })
      );
    });

    it('should accept names with special but safe characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'Jean-Pierre' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept unicode and international names', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'José García' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: 'José García' })
      );
    });

    it('should accept names at exactly 100 characters', async () => {
      const name100 = 'a'.repeat(100);
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: name100 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept single character names', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'A' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST endpoint - XSS Payload Sanitization', () => {
    it('should sanitize script tags in names', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<script>alert(1)</script>' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: '&lt;script&gt;alert(1)&lt;/script&gt;' })
      );
    });

    it('should sanitize HTML event handlers', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<img src=x onerror="alert(1)">' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;' })
      );
    });

    it('should sanitize all dangerous HTML characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<div>"test" & \'quotes\'</div>' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const storedName = mockRedis.hset.mock.calls[0][1].name;
      expect(storedName).toContain('&lt;');
      expect(storedName).toContain('&gt;');
      expect(storedName).toContain('&quot;');
      expect(storedName).toContain('&#x27;');
      expect(storedName).toContain('&amp;');
    });

    it('should sanitize iframe injection attempts', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<iframe src="evil.com">' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: '&lt;iframe src=&quot;evil.com&quot;&gt;' })
      );
    });

    it('should sanitize SVG with script tags', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<svg><script>alert(1)</script></svg>' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const storedName = mockRedis.hset.mock.calls[0][1].name;
      expect(storedName).not.toContain('<script>');
      expect(storedName).toContain('&lt;');
      expect(storedName).toContain('&gt;');
    });

    it('should sanitize names with apostrophes (common legitimate use)', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: "O'Brien" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({ name: 'O&#x27;Brien' })
      );
    });

    it('should ensure sanitized names are used in welcome email', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<script>alert(1)</script>' }),
      });

      const response = await POST(request);
      await response.json();

      expect(mockResend.emails.send).toHaveBeenCalled();
      const emailCall = mockResend.emails.send.mock.calls[0][0];
      expect(emailCall.html).toContain('&lt;script&gt;');
      expect(emailCall.html).not.toContain('<script>alert');
    });

    it('should ensure sanitized names are used in admin notification', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '<img onerror="alert(1)">' }),
      });

      const response = await POST(request);
      await response.json();

      // Check admin email (second email.send call)
      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
      const adminEmailCall = mockResend.emails.send.mock.calls[1][0];
      expect(adminEmailCall.html).toContain('&lt;img');
      expect(adminEmailCall.html).not.toContain('<img onerror');
    });
  });

  describe('POST endpoint - Name Length Validation', () => {
    it('should reject names over 100 characters', async () => {
      const name101 = 'a'.repeat(101);
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: name101 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('100 characters');
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it('should reject names much longer than limit', async () => {
      const name500 = 'a'.repeat(500);
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: name500 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it('should validate length after trimming whitespace', async () => {
      // 98 chars + 2 spaces = 100 total, but 98 after trim (should pass)
      const name = ' ' + 'a'.repeat(98) + ' ';
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject names that exceed limit after trimming', async () => {
      // 101 chars + 2 spaces = 103 total, 101 after trim (should fail)
      const name = ' ' + 'a'.repeat(101) + ' ';
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });
  });

  describe('POST endpoint - Empty/Whitespace Name Handling', () => {
    it('should accept empty string as name (optional field)', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled(); // Empty name not stored
    });

    it('should treat whitespace-only name as no name provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it('should handle null name gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: null }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it('should handle undefined name (field not provided)', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });

    it('should use "Hi there," in welcome email when name is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '' }),
      });

      const response = await POST(request);
      await response.json();

      const emailCall = mockResend.emails.send.mock.calls[0][0];
      expect(emailCall.html).toContain('Hi there,');
      expect(emailCall.html).not.toContain('Hi ,'); // Should not have empty name
    });

    it('should use "No name" in admin email when name is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '' }),
      });

      const response = await POST(request);
      await response.json();

      const adminEmailCall = mockResend.emails.send.mock.calls[1][0];
      expect(adminEmailCall.html).toContain('No name');
    });

    it('should handle various whitespace characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: '\t\n\r' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.hset).not.toHaveBeenCalled();
    });
  });

  describe('POST endpoint - Email Validation with Arcjet', () => {
    it('should reject disposable email addresses', async () => {
      mockArcjet.protect.mockResolvedValue({
        isDenied: () => true,
      });

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@tempmail.com', name: 'John Doe' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid or disposable email');
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });
  });

  describe('POST endpoint - Duplicate Email Handling', () => {
    it('should reject duplicate email submissions', async () => {
      mockRedis.sismember.mockResolvedValue(1); // Email already exists

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'existing@example.com', name: 'John Doe' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Email already registered');
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });
  });

  describe('POST endpoint - Service Configuration', () => {
    it('should return 503 when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'John Doe' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('not configured');
    });
  });

  describe('GET endpoint', () => {
    it('should return current waitlist count', async () => {
      mockRedis.scard.mockResolvedValue(123);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(123);
    });

    it('should return 0 when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(0);
    });

    it('should return 0 on error', async () => {
      mockRedis.scard.mockRejectedValue(new Error('Redis error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(0);
    });
  });

  describe('POST endpoint - Edge Cases', () => {
    it('should handle names with mixed XSS and legitimate content', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'John <script>alert(1)</script> Doe' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const storedName = mockRedis.hset.mock.calls[0][1].name;
      expect(storedName).toContain('John');
      expect(storedName).toContain('Doe');
      expect(storedName).toContain('&lt;script&gt;');
      expect(storedName).not.toContain('<script>');
    });

    it('should handle unicode characters with XSS attempts', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'José<script>alert(1)</script>' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const storedName = mockRedis.hset.mock.calls[0][1].name;
      expect(storedName).toContain('José');
      expect(storedName).toContain('&lt;script&gt;');
    });

    it('should handle name at boundary with HTML characters', async () => {
      // Create a 96-char name + 4 chars that will be escaped (< > to &lt; &gt;)
      const name = 'a'.repeat(96) + '<>';
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const storedName = mockRedis.hset.mock.calls[0][1].name;
      expect(storedName).toContain('&lt;&gt;');
    });

    it('should store timestamp with user data', async () => {
      const beforeTime = Date.now();

      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'John Doe' }),
      });

      const response = await POST(request);
      await response.json();

      const afterTime = Date.now();

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'waitlist:user:test@example.com',
        expect.objectContaining({
          name: 'John Doe',
          timestamp: expect.any(Number),
        })
      );

      const storedData = mockRedis.hset.mock.calls[0][1];
      expect(storedData.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(storedData.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle non-string name types gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 12345 }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should fail Zod validation since name must be a string
      expect(response.status).toBe(400);
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it('should handle object as name gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: { first: 'John', last: 'Doe' } }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should fail Zod validation since name must be a string
      expect(response.status).toBe(400);
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });
  });
});
