const express = require('express');

function createTechniciansRouter({ technicians }) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    res.json(await technicians.list());
  });

  return router;
}

module.exports = { createTechniciansRouter };
