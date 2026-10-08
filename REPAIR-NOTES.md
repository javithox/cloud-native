# Informe de reparación — CampusLab

## Cambios aplicados

- **Token de reservas:** el interceptor MSAL ahora cubre tanto la URL exacta de cada API como sus subrutas. Esto evita perder el bearer token en solicitudes a `/api/bookings` sin slash final.
- **Rutas de reservas:** los `GET` y `POST` raíz dejaron de enviar un slash final, alineándose con el mapping de Spring `@RequestMapping("/api/bookings")`.
- **Validación de identidad:** el backend de reservas valida firma, vigencia, emisor v1 de Entra, tenant (`tid`) y audiencia (`aud`). La URL de claves corresponde al endpoint v1 del tenant; no se deshabilitó la validación ni se aceptan audiencias arbitrarias.
- **Roles:** las variantes con acento se normalizan (por ejemplo, `Técnico` → `TECNICO`) y se admite el claim personalizado `appRole`. El servidor sigue exigiendo roles para autorizar: seleccionar un perfil en el frontend no concede permisos.
- **Compose local:** las URLs de API son configurables; los valores predeterminados ahora apuntan a `localhost` y la audiencia JWT se pasa al contenedor de reservas.
- **Limpieza:** se restauró el bit ejecutable de `backend/mvnw`, se añadieron exclusiones de secretos/datos locales a `.gitignore`, y se retiraron del paquete el `.env` real, su respaldo, bases H2 locales, archivos vacíos accidentales y una configuración MCP inválida.

## Validación ejecutada

- Backend: `./mvnw clean test` — **BUILD SUCCESS**, 5 tests, 0 fallos.
- Frontend: `npm test -- --watch=false` — **7 tests, 0 fallos**.
- Frontend: `npm run build` — compilación correcta. Queda un aviso no bloqueante: bundle inicial de ~703 kB frente al warning budget de 500 kB.
- YAML de Compose y de reservas: válido.
- No se pudo ejecutar `docker compose up` en este sandbox porque Docker no está instalado; el stack integrado requiere probarse en una máquina con Docker Compose.

## Inicio

Desde la raíz del proyecto:

```bash
cp .env.example .env
# En producción, cambia contraseñas y reemplaza las URLs locales por el dominio HTTPS.
docker compose up --build
```

Frontend local: `http://localhost:4200`.

Para ejecutar las pruebas:

```bash
cd backend && ./mvnw clean test
cd ../Frontend && npm ci && npm test -- --watch=false && npm run build
```

## Configuración pendiente de Entra ID

- Verifica que `TENANT_ID` y `JWT_AUDIENCE` coincidan con la API registrada y con los valores de `Frontend/src/environments/`.
- Asigna roles de aplicación a los usuarios en Entra para que el access token incluya un claim autorizado (`roles`, `role`, `groups` o `appRole`). El token compartido no muestra un claim de rol; sin asignación, la autenticación puede funcionar pero Booking responderá **403 Forbidden**.
- El servicio está configurado para access tokens v1 (`iss` de `sts.windows.net`). Si cambias el registro para emitir tokens v2, hay que ajustar también issuer y JWKS; consulta la [documentación oficial de Microsoft](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens).

## Importante sobre la credencial compartida

El JWT pegado en la conversación se trató como secreto: no se guardó en archivos, no se puso en `.env` y no se usó para llamar al servicio. Como quedó expuesto, considéralo comprometido: cierra/revoca las sesiones o refresh tokens desde Entra y vuelve a autenticarte para obtener un access token nuevo. No lo vuelvas a enviar por chat, subir a Git ni imprimir en logs.
