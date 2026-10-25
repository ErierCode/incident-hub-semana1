const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');
const { canTransition } = require('../src/domain/status');

const newIncident = {
  title: 'Sin acceso a la VPN',
  description: 'El cliente VPN rechaza las credenciales desde esta mañana.',
  category: 'ACCESOS',
  priority: 'ALTA',
  reportedBy: 'Pedro Ruiz',
};

describe('Asignación y estados de incidentes', () => {
  let app;
  let db;
  let incidentId;

  beforeEach(async () => {
    db = createTestDb();
    app = createApp({ db });
    const res = await request(app).post('/api/incidents').send(newIncident);
    incidentId = res.body.id;
  });

  async function systemLog() {
    const { rows } = await db.query(
      `SELECT author, message FROM incident_comments WHERE incident_id = $1 AND type = 'SISTEMA' ORDER BY id`,
      [incidentId],
    );
    return rows;
  }

  describe('GET /api/technicians', () => {
    it('lista los técnicos disponibles', async () => {
      const res = await request(app).get('/api/technicians');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toHaveProperty('name');
    });
  });

  describe('PATCH /api/incidents/:id/assign', () => {
    it('asigna un técnico, pasa a ASIGNADO y registra la bitácora', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${incidentId}/assign`)
        .send({ technicianId: 1, changedBy: 'Coordinador TI' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 'ASIGNADO', technician_id: 1, technician_name: 'Ana López' });
      expect(await systemLog()).toEqual([{ author: 'Coordinador TI', message: 'Asignado a Ana López' }]);
    });

    it('permite reasignar sin cambiar el estado', async () => {
      await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 1 });

      const res = await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 2 });

      expect(res.body).toMatchObject({ status: 'ASIGNADO', technician_id: 2 });
      expect((await systemLog())[1].message).toBe('Reasignado a Carlos Méndez');
    });

    it('rechaza técnicos inexistentes', async () => {
      const res = await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 99 });

      expect(res.status).toBe(400);
    });

    it('rechaza technicianId inválido', async () => {
      const res = await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 'uno' });

      expect(res.status).toBe(400);
    });

    it('no permite asignar un incidente cerrado', async () => {
      await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 1 });
      for (const status of ['EN_PROCESO', 'RESUELTO', 'CERRADO']) {
        await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status });
      }

      const res = await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 2 });

      expect(res.status).toBe(409);
    });
  });

  describe('PATCH /api/incidents/:id/status', () => {
    it('recorre el ciclo completo hasta CERRADO', async () => {
      await request(app).patch(`/api/incidents/${incidentId}/assign`).send({ technicianId: 3 });

      for (const status of ['EN_PROCESO', 'RESUELTO', 'CERRADO']) {
        const res = await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(status);
      }

      const log = await systemLog();
      expect(log.map((entry) => entry.message)).toEqual([
        'Asignado a Lucía Herrera',
        'Estado cambiado de ASIGNADO a EN_PROCESO',
        'Estado cambiado de EN_PROCESO a RESUELTO',
        'Estado cambiado de RESUELTO a CERRADO',
      ]);
    });

    it('rechaza saltos de estado con 409', async () => {
      const res = await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status: 'RESUELTO' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('NUEVO → RESUELTO');
    });

    it('exige un técnico para pasar a ASIGNADO', async () => {
      const res = await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status: 'ASIGNADO' });

      expect(res.status).toBe(409);
    });

    it('rechaza estados desconocidos con 400', async () => {
      const res = await request(app).patch(`/api/incidents/${incidentId}/status`).send({ status: 'PAUSADO' });

      expect(res.status).toBe(400);
    });

    it('devuelve 404 para incidentes inexistentes', async () => {
      const res = await request(app).patch('/api/incidents/999/status').send({ status: 'EN_PROCESO' });

      expect(res.status).toBe(404);
    });
  });

  describe('canTransition', () => {
    it.each([
      ['NUEVO', 'ASIGNADO', true],
      ['ASIGNADO', 'EN_PROCESO', true],
      ['RESUELTO', 'EN_PROCESO', true],
      ['CERRADO', 'NUEVO', false],
      ['NUEVO', 'CERRADO', false],
    ])('%s → %s = %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });
  });
});
