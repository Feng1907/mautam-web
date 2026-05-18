import { createRequire } from 'node:module';
import { describe, it, expect } from 'vitest';

const require = createRequire(import.meta.url);
const request = require('supertest');

// BASE_URL được truyền từ CI (http://localhost:5000) hoặc fallback sang supertest với app
const raw = process.env.BASE_URL ?? '';
const BASE_URL = /^https?:\/\/.+/.test(raw) ? raw : null;

describe('Integration — server health', () => {
  it('GET /api/health trả về 200 và success:true', async () => {
    if (BASE_URL) {
      // Chạy trong CI: hit server thật đang chạy
      const res = await fetch(`${BASE_URL}/api/health`);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    } else {
      // Chạy local: dùng supertest trực tiếp với app
      const app = require('../../src/app');
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });
});
