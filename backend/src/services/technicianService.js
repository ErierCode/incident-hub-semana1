function createTechnicianService(db) {
  async function list() {
    const { rows } = await db.query('SELECT id, name, email FROM technicians ORDER BY name');
    return rows;
  }

  async function findById(id) {
    const { rows } = await db.query('SELECT id, name, email FROM technicians WHERE id = $1', [id]);
    return rows[0] || null;
  }

  return { list, findById };
}

module.exports = { createTechnicianService };
