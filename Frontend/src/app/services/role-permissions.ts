export type AppRole = 'Admin' | 'Técnico' | 'Estudiante' | 'Auditor';

export type DashboardMetric = {
  label: string;
  value: string;
};

export type RoleAction = {
  label: string;
  description: string;
};

export type RoleDefinition = {
  label: string;
  description: string;
  capabilities: string[];
  routes: string[];
  metrics: DashboardMetric[];
  actions: RoleAction[];
};

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  Admin: {
    label: 'Administrador',
    description: 'Control operativo de todo el campus y supervisión del cumplimiento.',
    capabilities: [
      'Gestionar todas las reservas',
      'Administrar catálogo y recursos',
      'Revisar reportes y auditoría',
      'Resolver incidencias críticas',
    ],
    routes: ['/dashboard', '/bookings', '/catalog', '/reports', '/audit'],
    metrics: [
      { label: 'Ocupación de laboratorios', value: '74%' },
      { label: 'Reservas hoy', value: '48' },
      { label: 'Recursos críticos', value: '6' },
    ],
    actions: [
      { label: 'Aprobar reservas', description: 'Validar solicitudes pendientes y priorizar urgencias.' },
      { label: 'Revisar KPI', description: 'Analizar indicadores de ocupación y calidad de servicio.' },
      { label: 'Resolver incidencias', description: 'Cerrar alertas sobre equipos o reservas problemáticas.' },
    ],
  },
  Técnico: {
    label: 'Técnico',
    description: 'Preparación y mantenimiento de equipos y laboratorios.',
    capabilities: [
      'Preparar equipos y recursos',
      'Actualizar estado de reservas',
      'Revisar inventario y disponibilidad',
      'Coordinar soporte operativo',
    ],
    routes: ['/dashboard', '/bookings', '/catalog'],
    metrics: [
      { label: 'Reservas por preparar', value: '12' },
      { label: 'Equipos pendientes', value: '4' },
      { label: 'Tasa de cumplimiento', value: '91%' },
    ],
    actions: [
      { label: 'Preparar laboratorio', description: 'Confirmar que los recursos están listos antes del uso.' },
      { label: 'Actualizar estado', description: 'Avanzar de solicitud a uso y finalización.' },
      { label: 'Coordinar mantenimiento', description: 'Registrar incidencias para equipos con riesgo técnico.' },
    ],
  },
  Estudiante: {
    label: 'Estudiante',
    description: 'Solicitar y consultar sus reservas y actividades académicas.',
    capabilities: [
      'Solicitar reservas propias',
      'Consultar próximas actividades',
      'Ver disponibilidad de recursos',
      'Recibir confirmaciones y recordatorios',
    ],
    routes: ['/dashboard', '/bookings'],
    metrics: [
      { label: 'Próximas reservas', value: '3' },
      { label: 'Reservas confirmadas', value: '2' },
      { label: 'Pendientes', value: '1' },
    ],
    actions: [
      { label: 'Solicitar reserva', description: 'Crear una nueva reserva para un recurso disponible.' },
      { label: 'Consultar agenda', description: 'Revisar tus horarios y confirmaciones próximas.' },
      { label: 'Cancelar si aplica', description: 'Anular una reserva cuando cambie tu agenda.' },
    ],
  },
  Auditor: {
    label: 'Auditor',
    description: 'Supervisión de trazabilidad, cumplimiento y controles de seguridad.',
    capabilities: [
      'Ver auditoría y trazabilidad',
      'Analizar eventos del sistema',
      'Validar cumplimiento operativo',
      'Generar evidencia para revisión',
    ],
    routes: ['/dashboard', '/audit'],
    metrics: [
      { label: 'Eventos revisados', value: '132' },
      { label: 'Anomalías', value: '3' },
      { label: 'Incidencias cerradas', value: '96%' },
    ],
    actions: [
      { label: 'Revisar trazabilidad', description: 'Consultar eventos y correlaciones entre acciones.' },
      { label: 'Validar cumplimiento', description: 'Confirmar que las operaciones siguen los procedimientos.' },
      { label: 'Generar evidencia', description: 'Preparar hallazgos para auditoría interna o externa.' },
    ],
  },
};

export const DEFAULT_ROLE: AppRole = 'Estudiante';

export function getRoleDefinition(role: AppRole | null | undefined): RoleDefinition {
  if (!role) {
    return ROLE_DEFINITIONS[DEFAULT_ROLE];
  }

  return ROLE_DEFINITIONS[role] ?? ROLE_DEFINITIONS[DEFAULT_ROLE];
}

export function canAccessRoute(role: AppRole | null | undefined, route: string): boolean {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  const routeList = getRoleDefinition(role).routes.map((item) =>
    item.startsWith('/') ? item : `/${item}`,
  );

  return routeList.some((allowedRoute) => {
    return normalizedRoute === allowedRoute || normalizedRoute.startsWith(`${allowedRoute}/`);
  });
}
