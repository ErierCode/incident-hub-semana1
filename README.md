# IT Incident Hub

Solución web para registrar, operar y dar seguimiento a incidentes de TI. Sustituye los reportes dispersos en llamadas, mensajería y correo por un flujo trazable, construido como proyecto integrador DevOps.

## Requisitos

- Node.js 20 o superior (probado con 22 LTS)
- Docker Desktop (para PostgreSQL local)
- Git

## Instalación

```bash
git clone https://github.com/ErierCode/incident-hub-semana1.git
cd incident-hub-semana1
cp .env.example .env        # definir DB_PASSWORD
npm install
```

## Ejecución

```bash
docker compose up -d        # PostgreSQL 16
npm run migrate             # esquema + datos iniciales
npm run dev:api             # API en http://localhost:3000
```

Verificar: `curl http://localhost:3000/health`

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio y la base de datos |
| GET | `/api/incidents` | Lista; filtros `?status=&priority=&category=&technicianId=` |
| POST | `/api/incidents` | Crea incidente `{ title, description, category, priority, reportedBy }` |
| GET | `/api/incidents/:id` | Detalle |
| PATCH | `/api/incidents/:id/assign` | Asigna técnico `{ technicianId, changedBy? }` |
| PATCH | `/api/incidents/:id/status` | Cambia estado `{ status, changedBy? }` |
| GET | `/api/incidents/:id/comments` | Bitácora (comentarios + eventos del sistema) |
| POST | `/api/incidents/:id/comments` | Agrega comentario `{ author, message }` |
| GET | `/api/technicians` | Técnicos disponibles |

## Pruebas

```bash
npm run lint
npm test
```

Las pruebas usan un PostgreSQL en memoria (pg-mem), no necesitan Docker.

## Estructura

```
backend/     API REST (Express)
database/    migraciones SQL y seed
docs/        arquitectura, ramas y demás documentación
```

## Documentación

- [Arquitectura](docs/architecture.md)
- [Estrategia de ramas](docs/branching.md)

## Responsables

| Integrante | Rol |
|---|---|
| Erick Pu (`ErierCode` / `epur@miumg.edu.gt`) | Desarrollo, DevOps y documentación |

Planificación en Azure Boards: proyecto `proyectoFinal` de la organización `epur`.
