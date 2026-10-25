const { HttpError } = require('../httpError');

const INCIDENT_COLUMNS = `
  i.id, i.title, i.description, i.category, i.priority, i.reported_by, i.status,
  i.technician_id, t.name AS technician_name, i.created_at, i.updated_at`;

function createIncidentService(db) {
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

  async function list() {
    const { rows } = await db.query(
      `SELECT ${INCIDENT_COLUMNS}
       FROM incidents i LEFT JOIN technicians t ON t.id = i.technician_id
       ORDER BY i.created_at DESC, i.id DESC`,
    );
    return rows;
  }

  return { create, getById, list };
}

module.exports = { createIncidentService };
