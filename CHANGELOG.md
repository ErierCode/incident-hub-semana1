# Changelog

Todas las versiones siguen [Semantic Versioning](https://semver.org/lang/es/) y el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.1.0] - 2026-10-24

### Agregado
- Estructura del monorepo, docker-compose de PostgreSQL y migración inicial (AB#18).
- `GET /health` con versión y estado de la base de datos.
- `POST /api/incidents`, `GET /api/incidents` y `GET /api/incidents/:id` (AB#19).
