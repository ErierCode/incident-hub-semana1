const { Pool } = require('pg');

// Conexión a PostgreSQL. La contraseña se lee del entorno (DB_PASSWORD).
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'incident_hub',
  user: 'incident',
  password: process.env.DB_PASSWORD,
});

module.exports = { pool };
