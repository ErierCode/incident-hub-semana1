-- Esquema inicial de IT Incident Hub

CREATE TABLE IF NOT EXISTS technicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  priority VARCHAR(10) NOT NULL,
  reported_by VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NUEVO',
  technician_id INTEGER REFERENCES technicians(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_comments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'COMENTARIO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_comments_incident ON incident_comments(incident_id);
