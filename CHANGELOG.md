# Changelog

Todas las versiones siguen [Semantic Versioning](https://semver.org/lang/es/) y el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.2.0] - 2026-10-24

### Agregado
- `GET /api/technicians` y asignación/reasignación de técnico con `PATCH /api/incidents/:id/assign` (AB#22).
- Máquina de estados NUEVO → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO con `PATCH /api/incidents/:id/status` (AB#23).
- Bitácora automática de asignaciones y cambios de estado (AB#26).
- Comentarios por incidente: `GET/POST /api/incidents/:id/comments` (AB#25).
- Filtros combinables en `GET /api/incidents` por `status`, `priority`, `category` y `technicianId` (AB#20).

## [0.1.0] - 2026-10-24

### Agregado
- Estructura del monorepo, docker-compose de PostgreSQL y migración inicial (AB#18).
- `GET /health` con versión y estado de la base de datos.
- `POST /api/incidents`, `GET /api/incidents` y `GET /api/incidents/:id` (AB#19).
