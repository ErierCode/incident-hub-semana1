// Transiciones permitidas del ciclo de vida de un incidente.
// RESUELTO puede volver a EN_PROCESO si la solución no fue aceptada.
const TRANSITIONS = {
  NUEVO: ['ASIGNADO'],
  ASIGNADO: ['EN_PROCESO'],
  EN_PROCESO: ['RESUELTO'],
  RESUELTO: ['CERRADO', 'EN_PROCESO'],
  CERRADO: [],
};

// Estados en los que se puede asignar o reasignar un técnico.
const ASSIGNABLE = ['NUEVO', 'ASIGNADO', 'EN_PROCESO'];

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

module.exports = { TRANSITIONS, ASSIGNABLE, canTransition };
