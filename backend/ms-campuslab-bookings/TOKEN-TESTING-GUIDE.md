# Token Testing - Guía Rápida

## Ejecutar ms-campuslab-bookings CON Seguridad Deshabilitada (Desarrollo Local)

```bash
cd /home/oem/Desktop/cloud-native/backend/ms-campuslab-bookings
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

La aplicación estará disponible en: `http://localhost:8082`

**Con esta configuración:**
- ✅ Todos los endpoints son públicos (sin necesidad de token)
- ✅ Los endpoints `/api/public/token/*` generan tokens JWT para testing
- ✅ La seguridad está completamente deshabilitada

---

## Acceder a `/api/bookings` (sin token)

```bash
# Obtener todas las reservas
curl http://localhost:8082/api/bookings

# Crear una reserva
curl -X POST http://localhost:8082/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": 1,
    "startTime": "2024-10-15T10:00:00",
    "endTime": "2024-10-15T12:00:00"
  }'
```

---

## Generar Tokens JWT (para testing con seguridad habilitada)

### 1. Token de ADMIN (60 minutos)
```bash
curl http://localhost:8082/api/public/token/admin
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN",
  "expirationMinutes": 60,
  "usage": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Token de TECNICO
```bash
curl http://localhost:8082/api/public/token/tecnico
```

### 3. Token de ESTUDIANTE
```bash
curl http://localhost:8082/api/public/token/estudiante
```

### 4. Token personalizado
```bash
curl "http://localhost:8082/api/public/token?role=ADMIN&expirationMinutes=120"
```

### 5. Token con múltiples roles
```bash
curl -X POST http://localhost:8082/api/public/token/multi \
  -H "Content-Type: application/json" \
  -d '{"roles": ["ADMIN", "TECNICO"], "expirationMinutes": 120}'
```

---

## Usar Token en Peticiones (cuando seguridad esté habilitada)

```bash
# 1. Obtener token
TOKEN=$(curl -s http://localhost:8082/api/public/token/admin | jq -r '.token')

# 2. Usar token en requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/bookings
```

---

## Archivos Modificados

- `pom.xml` - Agregadas dependencias JJWT
- `application-local.yml` - Seguridad deshabilitada con `app.security.enabled: false`
- `RoleSecurityConfig.java` - Detecta cuando seguridad está deshabilitada
- `TokenGeneratorService.java` - Servicio para generar JWT tokens
- `TokenTestController.java` - Endpoints públicos para generar tokens

---

## Perfil de Ejecución

| Perfil | Comando | Seguridad | Validación JWT |
|--------|---------|-----------|----------------|
| **local** | `--spring.profiles.active=local` | ❌ Deshabilitada | ❌ No |
| **default** | (sin perfil) | ✅ Habilitada | ✅ Azure AD |
| **docker** | (ver application-docker.yml) | ✅ Habilitada | ✅ Azure AD |

---

## Próximos Pasos

1. **Desarrollo Local**: Ejecuta con perfil `local` para desarrollo rápido
2. **Testing**: Usa los endpoints `/api/public/token/*` para generar tokens
3. **Producción**: Asegúrate de usar Azure AD tokens en producción
