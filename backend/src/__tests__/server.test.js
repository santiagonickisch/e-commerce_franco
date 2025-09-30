const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should respond to detailed health check', async () => {
    const response = await request(app)
      .get('/health/detailed')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should respond to metrics endpoint', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.body).toHaveProperty('requests');
    expect(response.body).toHaveProperty('responseTime');
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should have proper CORS headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });

  it('should have security headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
  });
});
