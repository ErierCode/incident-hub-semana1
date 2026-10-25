const { newDb } = require('pg-mem');
const { loadSqlScripts } = require('../../src/db/sqlFiles');

// Base de datos PostgreSQL en memoria con el mismo esquema y seed que producción.
function createTestDb() {
  const mem = newDb();
  for (const script of loadSqlScripts()) {
    mem.public.none(script.sql);
  }
  const { Pool } = mem.adapters.createPg();
  return new Pool();
}

module.exports = { createTestDb };
