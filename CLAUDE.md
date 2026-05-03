# Barrio del Carmen — Sitio web

Sitio institucional de la Comisión Vecinal del Barrio del Carmen, Azul, Buenos Aires.

## Stack

- HTML5 + CSS3 + JavaScript vanilla (sin framework)
- Hosting: Cloudflare Pages (deploy automático desde `main`)
- Email transaccional: Brevo API v3
- Dominio: barriodelcarmen.com.ar (Nic.ar → Cloudflare DNS)

## Estructura

```
index.html          # Página única con todas las secciones
styles.css          # Todos los estilos
contact.js          # Handler del formulario (fetch a /contact)
functions/
  contact.js        # Cloudflare Pages Function → Brevo API
img/                # Imágenes estáticas
_headers            # Security headers de Cloudflare Pages
robots.txt
sitemap.xml
```

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `BREVO_API_KEY` | Cloudflare Pages → Settings → Variables y secretos | Enviar emails del formulario de contacto |

## Secciones del sitio

1. **Quiénes somos** — descripción + Comisión Directiva (12 integrantes)
2. **Qué hacemos** — actividades del barrio
3. **Nuestro barrio** — clubes, plazas, salud, parroquia, centro comunitario
4. **Historia** — origen del barrio (1920s) y capilla
5. **Dónde estamos** — link a Google Maps
6. **Contacto** — formulario → BREVO_API_KEY → contacto@barriodelcarmen.com.ar

## Email routing

`contacto@barriodelcarmen.com.ar` → email personal del administrador (Cloudflare Email Routing)

## Redes sociales

- Facebook: facebook.com/com.vec.barriodelcarmen.azul
- Instagram: instagram.com/barriodelcarmen.azul/

## Pendiente

- 4º club del barrio (nombre a confirmar)
- Nombres de las 2 plazas restantes además de Plaza Italia
