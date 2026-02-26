const request = require('supertest');
const app = require('../src/app');

describe('Sanity Check', () => {
  it('should redirect / to /login.html when unauthenticated', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(302);
    expect(res.header.location).toBe('/login.html');
  });

  it('should serve login.html', async () => {
    const res = await request(app).get('/login.html');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Nuestro Universo');
  });
});
