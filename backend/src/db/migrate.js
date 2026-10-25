const { pool } = require('./pool');
const { loadSqlScripts } = require('./sqlFiles');

async function migrate() {
  for (const script of loadSqlScripts()) {
    console.log(`Ejecutando ${script.name}`);
    await pool.query(script.sql);
  }
  await pool.end();
}

migrate().catch((err) => {
  console.log('Error al migrar:', err.message);
  process.exit(1);
});
