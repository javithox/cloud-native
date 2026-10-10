# Dashboard Mejorado - Guía de Actualización

## Resumen de Cambios

El dashboard ha sido completamente mejorado para mostrar datos dinámicos y relevantes según el rol del usuario seleccionado. Cada rol obtiene sus propias métricas en tiempo real desde el backend.

---

## 1. Nuevas Funcionalidades

### Selector de Roles Interactivo
- Dropdown en la esquina superior derecha del dashboard
- Permite cambiar entre 4 roles: Admin, Técnico, Estudiante, Auditor
- Las métricas se actualizan automáticamente al cambiar de rol

### Métricas Dinámicas por Rol

#### **Admin**
- 📊 **Ocupación de laboratorios**: Porcentaje de ocupación calculado a partir de reservas confirmadas
- 📅 **Reservas hoy**: Cantidad de reservas programadas para hoy
- ⚠️ **Recursos críticos**: Cantidad de recursos sin stock disponible

#### **Técnico**
- 🔧 **Reservas por preparar**: Reservas confirmadas que aún no han iniciado
- ⚙️ **Equipos pendientes**: Reservas en estado PENDING que requieren atención
- ✅ **Tasa de cumplimiento**: Porcentaje de reservas completadas vs total

#### **Estudiante**
- 📆 **Próximas reservas**: Cantidad de reservas futuras del estudiante
- ✔️ **Reservas confirmadas**: Cantidad de reservas en estado CONFIRMED
- ⏳ **Pendientes**: Cantidad de reservas en estado PENDING

#### **Auditor**
- 📋 **Eventos revisados**: Total de eventos de auditoría registrados
- 🚨 **Anomalías**: Cantidad de reservas canceladas (anomalías)
- 📊 **Incidencias cerradas**: Porcentaje de incidencias resueltas (COMPLETED)

---

## 2. Archivos Modificados

### Backend Service (`campuslab-api.service.ts`)

**Nuevos métodos agregados:**

```typescript
/**
 * Obtiene métricas del dashboard para rol Admin
 */
getAdminMetrics(): Observable<{
  labOccupancy: number;        // 0-100
  bookingsToday: number;       // cantidad
  criticalResources: number;   // cantidad
}>

/**
 * Obtiene métricas del dashboard para rol Técnico
 */
getTechnicianMetrics(): Observable<{
  bookingsToPrepare: number;   // cantidad
  pendingEquipment: number;    // cantidad
  complianceRate: number;      // 0-100
}>

/**
 * Obtiene métricas del dashboard para rol Estudiante
 */
getStudentMetrics(studentId: string): Observable<{
  upcomingBookings: number;    // cantidad
  confirmedBookings: number;   // cantidad
  pendingBookings: number;     // cantidad
}>

/**
 * Obtiene métricas del dashboard para rol Auditor
 */
getAuditorMetrics(): Observable<{
  eventsReviewed: number;      // cantidad
  anomalies: number;           // cantidad
  incidencesClosed: number;    // 0-100
}>
```

**Imports Agregados:**
- `switchMap` - Para combinar llamadas a múltiples endpoints

---

### Dashboard Component (`dashboard.ts`)

**Cambios principales:**

1. **Inyecciones de dependencias**:
   - `CampusLabApiService` - Para obtener datos del backend
   - `AuthService` - Para obtener rol y ID del usuario

2. **Nuevas propiedades**:
   ```typescript
   selectedRole: AppRole               // Rol actualmente seleccionado
   availableRoles: Array<...>          // Lista de roles disponibles
   metrics: DashboardMetric[]          // Métricas dinámicas
   isLoadingMetrics: boolean           // Indicador de carga
   metricsError: string | null         // Mensaje de error
   ```

3. **Nuevos métodos**:
   ```typescript
   ngOnInit()              // Carga métricas al inicializar
   ngOnDestroy()           // Limpia suscripciones
   onRoleChange()          // Se ejecuta al cambiar de rol
   loadDashboardMetrics()  // Carga datos según el rol seleccionado
   loadFallbackMetrics()   // Carga datos por defecto si hay error
   ```

---

### Dashboard Template (`dashboard.html`)

**Mejoras visuales:**

1. **Selector de rol en el header**
2. **Sección de capacidades mejorada** con descripción y lista de capacidades
3. **Sección de métricas** con:
   - Indicador de carga
   - Manejo de errores
   - Tarjetas con iconos y valores dinámicos
4. **Sección de acciones** mostrando las operaciones disponibles para el rol

---

### Dashboard Styles (`dashboard.scss`)

**Mejoras de diseño:**

- Selector de rol con estilos interactivos
- Sección de resumen con gradiente y layout mejorado
- Tarjetas de métricas con efectos hover
- Tarjetas de acciones con color de acento (azul/verde)
- Diseño responsive para móviles
- Animaciones suaves en transiciones

---

### Auth Service (`auth.service.ts`)

**Nuevo método agregado:**

```typescript
/**
 * Obtiene el ID del usuario desde la cuenta activa.
 * Intenta obtener en este orden: oid, sub, email, localAccountId, username
 */
getUserId(): string | null
```

---

## 3. Flujo de Datos

```
Usuario selecciona rol en dropdown
            ↓
onRoleChange() se ejecuta
            ↓
loadDashboardMetrics() determina qué método llamar según rol
            ↓
┌─────────────────────────────────────────────────────┐
│ Según el rol seleccionado:                          │
│ - Admin      → getAdminMetrics()                    │
│ - Técnico    → getTechnicianMetrics()               │
│ - Estudiante → getStudentMetrics(studentId)         │
│ - Auditor    → getAuditorMetrics()                  │
└─────────────────────────────────────────────────────┘
            ↓
API obtiene datos del backend (/api/bookings)
            ↓
Se procesan y transforman en métricas
            ↓
Las métricas se muestran en tarjetas dinámicas
```

---

## 4. Cálculos de Métricas

### Ocupación de Laboratorios (Admin)
```
occupancy = (reservas_confirmadas_hoy / (recursos * 4)) * 100
```

### Tasa de Cumplimiento (Técnico)
```
compliance = (reservas_completadas / total_reservas) * 100
```

### Incidencias Cerradas (Auditor)
```
rate = (eventos_completados / total_eventos) * 100
```

---

## 5. Manejo de Errores

- ✅ Indicador de carga mientras se obtienen datos
- ✅ Mensaje de error si algo falla
- ✅ Datos fallback (valores por defecto) como respaldo
- ✅ Cleanup de suscripciones al destruir componente

---

## 6. Ventajas de la Nueva Implementación

1. **Datos en tiempo real**: Métricas calculadas a partir de datos actuales del backend
2. **Personalizadas por rol**: Cada rol ve lo que le es relevante
3. **Responsivo**: Funciona bien en móviles y desktops
4. **Robusto**: Manejo de errores y fallback
5. **Interactivo**: Selector de roles con cambio instantáneo de datos
6. **Limpio**: Código modular y fácil de mantener

---

## 7. Próximas Mejoras Opcionales

- [ ] Gráficos interactivos (Chart.js, Plotly)
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Filtros avanzados por fecha
- [ ] Historial de cambios de rol
- [ ] Notificaciones en tiempo real
- [ ] Caché de datos con RxJS shareReplay()
- [ ] Persistencia de rol seleccionado en localStorage

---

## 8. Testing

Para probar el dashboard con diferentes roles:

1. Abre el dashboard
2. Selecciona un rol en el dropdown superior derecho
3. Observa cómo las métricas se actualizan automáticamente
4. Las capacidades y acciones también cambiarán según el rol

---

## 9. Integración con Backend

El dashboard obtiene datos de:
- `GET /api/bookings` - Para todas las métricas
- `GET /api/catalog/resources` - Para recursos (Admin)

Asegúrate de que estos endpoints estén disponibles y devuelvan datos válidos.
