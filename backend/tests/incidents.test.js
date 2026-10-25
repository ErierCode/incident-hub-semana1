const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');

const validIncident = {
  title: 'Impresora del 2do piso no imprime',
  description: 'La impresora HP muestra error de papel atascado.',
  category: 'HARDWARE',
  priority: 'MEDIA',
  reportedBy: 'María García',
};

describe('API de incidentes', () => {
  let app;

  beforeEach(() => {
    app = createApp({ db: createTestDb() });
  });

  describe('POST /api/incidents', () => {
    it('crea un incidente con estado NUEVO y fecha de creación', async () => {
      const res = await request(app).post('/api/incidents').send(validIncident);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        title: validIncident.title,
        category: 'HARDWARE',
        priority: 'MEDIA',
        reported_by: 'María García',
        status: 'NUEVO',
        technician_id: null,
      });
      expect(res.body.created_at).toBeDefined();
    });

    it.each([
      ['title', { title: '' }],
      ['description', { description: undefined }],
      ['category', { category: 'IMPRESORAS' }],
      ['priority', { priority: 'URGENTE' }],
      ['reportedBy', { reportedBy: '   ' }],
    ])('rechaza con 400 cuando %s es inválido', async (field, override) => {
      const res = await request(app).post('/api/incidents').send({ ...validIncident, ...override });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain(field);
    });

    it('rechaza títulos de más de 200 caracteres', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ ...validIncident, title: 'x'.repeat(201) });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/incidents/:id', () => {
    it('devuelve el incidente existente', async () => {
      const created = await request(app).post('/api/incidents').send(validIncident);

      const res = await request(app).get(`/api/incidents/${created.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(validIncident.title);
    });

    it('devuelve 404 si no existe', async () => {
      const res = await request(app).get('/api/incidents/999');

      expect(res.status).toBe(404);
    });

    it('devuelve 400 si el id no es numérico', async () => {
      const res = await request(app).get('/api/incidents/abc');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/incidents', () => {
    it('lista los incidentes del más reciente al más antiguo', async () => {
      await request(app).post('/api/incidents').send({ ...validIncident, title: 'Primero' });
      await request(app).post('/api/incidents').send({ ...validIncident, title: 'Segundo' });

      const res = await request(app).get('/api/incidents');

      expect(res.status).toBe(200);
      expect(res.body.map((i) => i.title)).toEqual(['Segundo', 'Primero']);
    });
  });
});
