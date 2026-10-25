const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');

const base = {
  description: 'Detalle del incidente',
  reportedBy: 'Usuario de prueba',
};

describe('Comentarios y filtros', () => {
  let app;

  beforeEach(() => {
    app = createApp({ db: createTestDb() });
  });

  async function createIncident(overrides) {
    const res = await request(app).post('/api/incidents').send({ ...base, ...overrides });
    return res.body;
  }

  describe('Bitácora /api/incidents/:id/comments', () => {
    it('agrega comentarios y los muestra junto a los eventos del sistema en orden', async () => {
      const incident = await createIncident({ title: 'Correo lento', category: 'SOFTWARE', priority: 'BAJA' });
      await request(app).patch(`/api/incidents/${incident.id}/assign`).send({ technicianId: 2 });

      const created = await request(app)
        .post(`/api/incidents/${incident.id}/comments`)
        .send({ author: 'Carlos Méndez', message: 'Revisando el buzón del usuario' });

      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({ type: 'COMENTARIO', author: 'Carlos Méndez' });

      const res = await request(app).get(`/api/incidents/${incident.id}/comments`);

      expect(res.status).toBe(200);
      expect(res.body.map((c) => [c.type, c.message])).toEqual([
        ['SISTEMA', 'Asignado a Carlos Méndez'],
        ['COMENTARIO', 'Revisando el buzón del usuario'],
      ]);
    });

    it.each([
      ['author', { message: 'hola' }],
      ['message', { author: 'Ana', message: '  ' }],
    ])('rechaza comentarios sin %s', async (field, body) => {
      const incident = await createIncident({ title: 'X', category: 'OTRO', priority: 'BAJA' });

      const res = await request(app).post(`/api/incidents/${incident.id}/comments`).send(body);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain(field);
    });

    it('devuelve 404 si el incidente no existe', async () => {
      const list = await request(app).get('/api/incidents/999/comments');
      const add = await request(app).post('/api/incidents/999/comments').send({ author: 'a', message: 'b' });

      expect(list.status).toBe(404);
      expect(add.status).toBe(404);
    });
  });

  describe('Filtros GET /api/incidents', () => {
    beforeEach(async () => {
      const red = await createIncident({ title: 'Sin internet', category: 'RED', priority: 'CRITICA' });
      await createIncident({ title: 'Mouse dañado', category: 'HARDWARE', priority: 'BAJA' });
      await createIncident({ title: 'Switch caído', category: 'RED', priority: 'ALTA' });
      await request(app).patch(`/api/incidents/${red.id}/assign`).send({ technicianId: 1 });
    });

    async function titles(query) {
      const res = await request(app).get('/api/incidents').query(query);
      expect(res.status).toBe(200);
      return res.body.map((i) => i.title).sort();
    }

    it('filtra por categoría', async () => {
      expect(await titles({ category: 'RED' })).toEqual(['Sin internet', 'Switch caído']);
    });

    it('filtra por prioridad', async () => {
      expect(await titles({ priority: 'BAJA' })).toEqual(['Mouse dañado']);
    });

    it('filtra por estado', async () => {
      expect(await titles({ status: 'ASIGNADO' })).toEqual(['Sin internet']);
    });

    it('filtra por técnico', async () => {
      expect(await titles({ technicianId: 1 })).toEqual(['Sin internet']);
    });

    it('combina filtros', async () => {
      expect(await titles({ category: 'RED', status: 'NUEVO' })).toEqual(['Switch caído']);
    });

    it.each([
      [{ status: 'ABIERTO' }],
      [{ priority: 'URGENTE' }],
      [{ category: 'IMPRESORAS' }],
      [{ technicianId: 'abc' }],
    ])('rechaza filtros inválidos %o', async (query) => {
      const res = await request(app).get('/api/incidents').query(query);

      expect(res.status).toBe(400);
    });
  });
});
