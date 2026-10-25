-- Datos iniciales: técnicos del área de TI
INSERT INTO technicians (name, email) VALUES
  ('Ana López', 'ana.lopez@empresa.local'),
  ('Carlos Méndez', 'carlos.mendez@empresa.local'),
  ('Lucía Herrera', 'lucia.herrera@empresa.local')
ON CONFLICT (email) DO NOTHING;
