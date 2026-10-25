const express = require('express');
const { CATEGORIES, PRIORITIES, STATUSES } = require('../domain/catalogs');

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo' });
    return null;
  }
  return id;
}

function createIncidentsRouter({ incidents }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const { status, priority, category, technicianId } = req.query;
    const filters = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `status debe ser uno de: ${STATUSES.join(', ')}` });
      }
      filters.status = status;
    }
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: `priority debe ser uno de: ${PRIORITIES.join(', ')}` });
      }
      filters.priority = priority;
    }
    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `category debe ser uno de: ${CATEGORIES.join(', ')}` });
      }
      filters.category = category;
    }
    if (technicianId !== undefined) {
      const parsed = Number(technicianId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'technicianId debe ser un entero positivo' });
      }
      filters.technicianId = parsed;
    }
    res.json(await incidents.list(filters));
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    res.json(await incidents.getById(id));
  });

  router.post('/', async (req, res) => {
    const { title, description, category, priority, reportedBy } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title es obligatorio' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'title no puede superar 200 caracteres' });
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'description es obligatorio' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category debe ser uno de: ${CATEGORIES.join(', ')}` });
    }
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `priority debe ser uno de: ${PRIORITIES.join(', ')}` });
    }
    if (!reportedBy || typeof reportedBy !== 'string' || reportedBy.trim() === '') {
      return res.status(400).json({ error: 'reportedBy es obligatorio' });
    }

    const incident = await incidents.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      reportedBy: reportedBy.trim(),
    });
    console.log(`Incidente ${incident.id} creado por ${incident.reported_by}`);
    res.status(201).json(incident);
  });

  router.patch('/:id/assign', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const { technicianId, changedBy } = req.body || {};
    if (!Number.isInteger(technicianId) || technicianId <= 0) {
      return res.status(400).json({ error: 'technicianId debe ser un entero positivo' });
    }
    if (changedBy !== undefined && (typeof changedBy !== 'string' || changedBy.trim() === '')) {
      return res.status(400).json({ error: 'changedBy debe ser un texto no vacío' });
    }

    const incident = await incidents.assign(id, technicianId, (changedBy || 'coordinador').trim());
    console.log(`Incidente ${id} asignado al técnico ${technicianId}`);
    res.json(incident);
  });

  router.patch('/:id/status', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const { status, changedBy } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status debe ser uno de: ${STATUSES.join(', ')}` });
    }
    if (changedBy !== undefined && (typeof changedBy !== 'string' || changedBy.trim() === '')) {
      return res.status(400).json({ error: 'changedBy debe ser un texto no vacío' });
    }

    const incident = await incidents.changeStatus(id, status, (changedBy || 'técnico').trim());
    console.log(`Incidente ${id} pasó a ${status}`);
    res.json(incident);
  });

  router.get('/:id/comments', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    res.json(await incidents.listComments(id));
  });

  router.post('/:id/comments', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const { author, message } = req.body || {};
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({ error: 'author es obligatorio' });
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'message es obligatorio' });
    }

    const comment = await incidents.addComment(id, author.trim(), message.trim());
    console.log(`Comentario agregado al incidente ${id}`);
    res.status(201).json(comment);
  });

  return router;
}

module.exports = { createIncidentsRouter, parseId };
