const express = require('express');
const { version } = require('../package.json');

function createApp({ db }) {
  const app = express();
  app.use(express.json());

  app.get('/health', async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', version, db: 'up' });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
  });

  app.use((err, _req, res, _next) => {
    console.log('Error no controlado:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
