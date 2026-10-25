const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');

describe('GET /health', () => {
  it('responde ok con la versión y el estado de la base de datos', async () => {
    const app = createApp({ db: createTestDb() });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'up' });
    expect(res.body.version).toBeDefined();
  });

  it('devuelve 404 para rutas inexistentes', async () => {
    const app = createApp({ db: createTestDb() });

    const res = await request(app).get('/no-existe');

    expect(res.status).toBe(404);
  });
});
