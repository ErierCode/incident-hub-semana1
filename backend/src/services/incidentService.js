const { HttpError } = require('../httpError');
const { ASSIGNABLE, canTransition } = require('../domain/status');

const INCIDENT_COLUMNS = `
  i.id, i.title, i.description, i.category, i.priority, i.reported_by, i.status,
  i.technician_id, t.name AS technician_name, i.created_at, i.updated_at`;

function createIncidentService(db, { technicians }) {
  // Entrada automática en la bitácora del incidente.
  async function logEvent(incidentId, author, message) {
    await db.query(
      `INSERT INTO incident_comments (incident_id, author, message, type)
       VALUES ($1, $2, $3, 'SISTEMA')`,
      [incidentId, author, message],
    );
  }

  async function getById(id) {
    const { rows } = await db.query(
      `SELECT ${INCIDENT_COLUMNS}
       FROM incidents i LEFT JOIN technicians t ON t.id = i.technician_id
       WHERE i.id = $1`,
      [id],
    );
    if (rows.length === 0) {
      throw new HttpError(404, `Incidente ${id} no encontrado`);
    }
    return rows[0];
  }

  async function create({ title, description, category, priority, reportedBy }) {
    const { rows } = await db.query(
      `INSERT INTO incidents (title, description, category, priority, reported_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [title, description, category, priority, reportedBy],
    );
    return getById(rows[0].id);
  }

  async function list(filters = {}) {
    const conditions = [];
    const params = [];
    const columns = { status: 'i.status', priority: 'i.priority', category: 'i.category', technicianId: 'i.technician_id' };
    for (const [key, column] of Object.entries(columns)) {
      if (filters[key] !== undefined) {
        params.push(filters[key]);
        conditions.push(`${column} = $${params.length}`);
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await db.query(
      `SELECT ${INCIDENT_COLUMNS}
       FROM incidents i LEFT JOIN technicians t ON t.id = i.technician_id
       ${where}
       ORDER BY i.created_at DESC, i.id DESC`,
      params,
    );
    return rows;
  }

  async function listComments(id) {
    await getById(id);
    const { rows } = await db.query(
      `SELECT id, author, message, type, created_at
       FROM incident_comments WHERE incident_id = $1
       ORDER BY created_at, id`,
      [id],
    );
    return rows;
  }

  async function addComment(id, author, message) {
    await getById(id);
    const { rows } = await db.query(
      `INSERT INTO incident_comments (incident_id, author, message, type)
       VALUES ($1, $2, $3, 'COMENTARIO')
       RETURNING id, author, message, type, created_at`,
      [id, author, message],
    );
    return rows[0];
  }

  async function assign(id, technicianId, changedBy) {
    const incident = await getById(id);
    if (!ASSIGNABLE.includes(incident.status)) {
      throw new HttpError(409, `No se puede asignar un incidente en estado ${incident.status}`);
    }
    const technician = await technicians.findById(technicianId);
    if (!technician) {
      throw new HttpError(400, `El técnico ${technicianId} no existe`);
    }

    const newStatus = incident.status === 'NUEVO' ? 'ASIGNADO' : incident.status;
    await db.query(
      `UPDATE incidents SET technician_id = $1, status = $2, updated_at = NOW() WHERE id = $3`,
      [technicianId, newStatus, id],
    );
    const action = incident.technician_id ? 'Reasignado' : 'Asignado';
    await logEvent(id, changedBy, `${action} a ${technician.name}`);
    return getById(id);
  }

  async function changeStatus(id, status, changedBy) {
    const incident = await getById(id);
    if (!canTransition(incident.status, status)) {
      throw new HttpError(409, `Transición no permitida: ${incident.status} → ${status}`);
    }
    if (status === 'ASIGNADO' && !incident.technician_id) {
      throw new HttpError(409, 'Para pasar a ASIGNADO use PATCH /assign con un técnico');
    }

    await db.query(`UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
    await logEvent(id, changedBy, `Estado cambiado de ${incident.status} a ${status}`);
    return getById(id);
  }

  return { create, getById, list, assign, changeStatus, listComments, addComment };
}

module.exports = { createIncidentService };
