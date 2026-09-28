# Captación No Exclusiva — formulario + panel de administración

Recreación del formulario de Jotform "CAPTACIÓN NO EXCLUSIVA" de MR. HOME, con un panel de
administración donde se puede personalizar cada parte del formulario: campos, textos legales,
diseño (logo, colores, tipografía), mensajes y notificaciones.

## Stack

- Next.js 14 (App Router) + TypeScript
- Vercel Blob (almacena la configuración del formulario, los envíos, las firmas y los archivos
  adjuntos)
- pdf-lib (genera el PDF del contrato a partir de la configuración y los datos enviados)
- Sesión de administrador con cookie firmada (HMAC), sin dependencias externas de autenticación

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Sí | La crea Vercel automáticamente al vincular un Blob Store al proyecto. |
| `ADMIN_PASSWORD` | Sí | Contraseña para entrar a `/admin`. |
| `SESSION_SECRET` | Sí | Cadena aleatoria usada para firmar la cookie de sesión del admin. |
| `RESEND_API_KEY` | No | Si se define, habilita el envío real de correos de notificación (vía Resend). |
| `NOTIFY_FROM_EMAIL` | No | Remitente del correo de notificación (por defecto `onboarding@resend.dev`). |

## Uso

- **Formulario público:** `/` — se renderiza dinámicamente a partir de la configuración guardada
  en Blob. Incluye guardar borrador (con enlace para continuar luego), firma digital, carga de
  anexos, vista previa en PDF antes de enviar y descarga del PDF final después de enviar.
- **Panel de administración:** `/admin` (pide la contraseña `ADMIN_PASSWORD`)
  - **Envíos:** bandeja con todos los envíos, exportación a CSV, PDF y archivos por envío.
  - **Campos y textos:** agregar, quitar, reordenar y editar los bloques de texto legal y los
    campos del formulario (etiqueta, tipo, obligatoriedad, ancho, opciones).
  - **Diseño:** logo, colores, tipografía y datos de contacto del pie de página.
  - **Ajustes:** textos de botones, mensaje de agradecimiento, notificaciones por correo y reglas
    de firma.

## Nota sobre privacidad de los documentos adjuntos

Los archivos adjuntos (cédula, título de propiedad, firmas) se guardan en Vercel Blob con acceso
`public` y nombre de archivo aleatorio: no aparecen en ningún listado público, pero cualquiera que
obtenga el enlace exacto podría abrirlos. Dado que este formulario recoge documentos de identidad,
si el cumplimiento normativo lo exige, conviene migrar a Blob con acceso `private` (requiere plan
Pro/Enterprise de Vercel) o añadir una capa de URLs firmadas con expiración.

## Desarrollo local

```bash
npm install
npm run dev
```

Se necesita un Blob Store de Vercel vinculado (`vercel env pull` para traer las variables) o bien
definir `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD` y `SESSION_SECRET` manualmente en `.env.local`.
