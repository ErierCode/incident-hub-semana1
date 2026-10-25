const { createApp } = require('./app');
const { pool } = require('./db/pool');

const PORT = 3000;

const app = createApp({ db: pool });

app.listen(PORT, () => {
  console.log(`IT Incident Hub API escuchando en http://localhost:${PORT}`);
});
