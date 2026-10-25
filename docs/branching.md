# Estrategia de ramas

Se usa **GitHub Flow con ramas de trabajo tipadas**. `main` siempre está estable y desplegable.

## Ramas

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/AB19-incidents-api` |
| `fix/` | Corrección de un defecto | `fix/AB34-pipeline-test` |
| `refactor/` | Pago de deuda técnica sin cambiar comportamiento | `refactor/AB38-validation-zod` |

El nombre incluye el ID del work item de Azure Boards (`AB<ID>`).

## Reglas de `main`

- Protegida: no se permite push directo (incluye administradores) ni force push.
- Todo cambio entra por Pull Request con descripción, revisión y conversaciones resueltas.
- Merge por **squash** para mantener un commit por PR; la rama se elimina al hacer merge.
- A partir de la semana 2, el PR exige los checks de Azure Pipelines y GitHub Actions en verde.

## Trazabilidad

Cada commit y cada PR mencionan su work item con `AB#ID` (por ejemplo `AB#19`). La integración Azure Boards ↔ GitHub enlaza automáticamente commits y PR en la sección *Development* del work item.

Flujo: **Task → rama `feature/*` → commit `AB#ID` → PR → revisión → `main` → pipeline → artefacto → release**.

## Convención de commits

[Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `test:`, `chore:`. Los tipos `feat` y `fix` guían el incremento de versión SemVer (ver `release-strategy.md`).
