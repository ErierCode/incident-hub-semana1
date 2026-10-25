# Arquitectura

## Vista general

```
Usuario ──► Frontend (React + Vite) ──► API REST (Node.js + Express) ──► PostgreSQL 16
```

| Capa | Tecnología | Carpeta |
|---|---|---|
| Frontend | React 18 + Vite | `frontend/` |
| API REST | Node.js 22 LTS + Express 5 | `backend/` |
| Persistencia | PostgreSQL 16 (Docker) | `database/` |
| Pruebas | Jest + Supertest, pg-mem (Postgres en memoria) | `backend/tests/`, `tests/` |
| CI/CD | Azure Pipelines (agente self-hosted) + GitHub Actions | `azure-pipelines.yml`, `.github/workflows/` |

## Backend

- `src/app.js`: crea la aplicación Express a partir de una dependencia `db` (cualquier objeto con `query(text, params)`). Esto permite usar el `Pool` real de `pg` en ejecución y un Postgres en memoria (`pg-mem`) en las pruebas.
- `src/routes/`: definición de endpoints HTTP.
- `src/services/`: reglas de negocio (creación, asignación, máquina de estados, bitácora).
- `src/db/`: conexión, carga de scripts SQL y migración.

## Modelo de datos

| Tabla | Propósito |
|---|---|
| `technicians` | Técnicos del área de TI que pueden recibir incidentes |
| `incidents` | Incidente: título, descripción, categoría, prioridad, usuario que reporta, estado, técnico, fechas |
| `incident_comments` | Bitácora por incidente: comentarios manuales (`COMENTARIO`) y eventos automáticos (`SISTEMA`) |

Catálogos:

- **Categoría**: `HARDWARE`, `SOFTWARE`, `RED`, `ACCESOS`, `OTRO`
- **Prioridad**: `BAJA`, `MEDIA`, `ALTA`, `CRITICA`
- **Estado**: `NUEVO` → `ASIGNADO` → `EN_PROCESO` → `RESUELTO` → `CERRADO`

## Decisiones

- **Monorepo con npm workspaces**: un solo `npm ci` instala backend y frontend; facilita el pipeline.
- **SQL plano en `database/`**: las migraciones son legibles y las ejecuta tanto `npm run migrate` como las pruebas.
- **pg-mem en pruebas**: las pruebas no requieren un servidor PostgreSQL, por lo que corren igual en el agente self-hosted y en GitHub Actions.
