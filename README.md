# Captación No Exclusiva — formulario + panel de administración

Recreación del formulario de Jotform "CAPTACIÓN NO EXCLUSIVA" de MR. HOME, con un panel de
administración donde se puede personalizar cada parte del formulario: campos, textos legales,
diseño (logo, colores, tipografía), mensajes y notificaciones.

## Stack

- Next.js 14 (App Router) + TypeScript
- Desplegado en **Netlify** (`@netlify/plugin-nextjs`, ver `netlify.toml`)
- Netlify Blobs (almacena la configuración del formulario, los envíos, las firmas y los archivos
  adjuntos). En producción en Netlify no requiere variables de entorno: el contexto del blob
  store lo inyecta Netlify automáticamente durante el build/deploy.
- pdf-lib (genera el PDF del contrato a partir de la configuración y los datos enviados)
- Sesión de administrador con cookie firmada (HMAC), sin dependencias externas de autenticación

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Sí | Contraseña para entrar a `/admin`. |
| `SESSION_SECRET` | Sí | Cadena aleatoria usada para firmar la cookie de sesión del admin. |
| `RESEND_API_KEY` | No | Si se define, habilita el envío real de correos de notificación (vía Resend). |
| `NOTIFY_FROM_EMAIL` | No | Remitente del correo de notificación (por defecto `onboarding@resend.dev`). |

Configura `ADMIN_PASSWORD` y `SESSION_SECRET` en Netlify (Site configuration → Environment
variables) antes del primer deploy en producción.

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

Los archivos adjuntos (cédula, título de propiedad, firmas) se guardan en Netlify Blobs y se
sirven a través de `/api/blob/[...key]`, con una clave aleatoria e impredecible: no aparecen en
ningún listado público, pero cualquiera que obtenga el enlace exacto podría abrirlos. Dado que
este formulario recoge documentos de identidad, si el cumplimiento normativo lo exige, conviene
añadir autenticación a esa ruta (por ejemplo, exigir la sesión de administrador o un token con
expiración) en vez de dejarla abierta por URL.

## Desarrollo local

```bash
npm install
netlify dev
```

`netlify dev` (CLI de Netlify) inyecta automáticamente el contexto de Netlify Blobs para
desarrollo local. Define `ADMIN_PASSWORD` y `SESSION_SECRET` en un archivo `.env` o con
`netlify env:set`.

<!-- redeploy trigger 1790615175 -->
<!-- redeploy 1790615764 -->
