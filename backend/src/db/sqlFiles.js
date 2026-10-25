const fs = require('fs');
const path = require('path');

const DATABASE_DIR = path.resolve(__dirname, '../../../database');

// Devuelve el SQL de migraciones (en orden) seguido del seed.
function loadSqlScripts() {
  const migrationsDir = path.join(DATABASE_DIR, 'migrations');
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => ({ name: file, sql: fs.readFileSync(path.join(migrationsDir, file), 'utf8') }));

  const seed = { name: 'seed.sql', sql: fs.readFileSync(path.join(DATABASE_DIR, 'seed.sql'), 'utf8') };
  return [...migrations, seed];
}

module.exports = { loadSqlScripts };
