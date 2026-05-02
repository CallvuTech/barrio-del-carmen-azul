# Presencia digital — Comisión Vecinal Barrio del Carmen, Azul

**Fecha:** 2026-05-02
**Estado:** Aprobado

---

## Contexto

La Comisión Vecinal del Barrio del Carmen de Azul necesita presencia digital para comunicar actividades, eventos y novedades del barrio. Tres integrantes publicarán contenido directamente desde sus teléfonos. El presupuesto es mínimo: solo el dominio ya adquirido.

---

## Plataformas

### Facebook Page

- **Tipo:** Page (no perfil personal) — categoría "Organización comunitaria"
- **Nombre:** Comisión Vecinal Barrio del Carmen - Azul
- **Descripción:** Somos el grupo de vecinos que organiza y cuida el Barrio del Carmen en Azul. Acá encontrás eventos, noticias y todo lo que pasa en el barrio.
- **Email público:** contacto@barriodelcarmen.com.ar
- **Sitio web:** https://barriodelcarmen.com.ar

### Instagram Business

- **Tipo:** Cuenta Business (no personal, no Creator)
- **Email de registro:** cuenta de Gmail creada para la comisión
- **Vinculación:** conectada a la Facebook Page para gestión unificada

### WhatsApp Channel (opcional, fase 2)

Canal de difusión unidireccional para vecinos que prefieren WhatsApp. No requiere que los vecinos tengan Facebook.

---

## Gestión de accesos

### Roles en Facebook Page

| Persona | Rol |
|---|---|
| Administrador técnico (Nicolás) | Admin |
| Señora 1 | Editor |
| Señora 2 | Editor |
| Señora 3 | Editor |

El rol **Editor** permite publicar, responder comentarios y ver estadísticas, pero no puede modificar configuración, agregar personas ni borrar la Page.

### App para publicar

Las tres señoras usan **Meta Business Suite** (app gratuita, iOS y Android). Inician sesión con su cuenta personal de Facebook y ven la Page de la comisión. Pueden publicar en Facebook e Instagram simultáneamente con un solo flujo.

### Requisito previo

Cada señora necesita una cuenta personal de Facebook activa antes de ser agregada como Editor.

---

## Sitio web

### Infraestructura

| Componente | Tecnología | Costo |
|---|---|---|
| Dominio | barriodelcarmen.com.ar (Nic.ar) | Pagado |
| DNS / CDN | Cloudflare (nameservers delegados desde Nic.ar) | Gratis |
| Hosting | Cloudflare Pages | Gratis |
| Email routing | Cloudflare Email Routing → email personal | Gratis |
| Email transaccional | Brevo (API) | Gratis hasta 300/día |
| Código fuente | GitHub repo `barrio-del-carmen-azul` | Gratis |

### Estructura (single page, scroll)

1. **Header** — logo o nombre de la comisión
2. **Quiénes somos** — descripción breve de la comisión
3. **Qué hacemos** — actividades del barrio
4. **Dónde estamos** — mapa embebido (Google Maps, iframe)
5. **Contacto** — formulario simple (nombre, mensaje) que envía por API de Brevo a `contacto@barriodelcarmen.com.ar`

### Formulario de contacto

- El formulario llama a la API transaccional de Brevo desde el frontend
- No requiere backend propio
- La API key de Brevo queda en una variable de entorno de Cloudflare Pages (no en el código fuente)

### Deploy

Cloudflare Pages conectado al repo de GitHub. Cada push a `main` publica el sitio automáticamente. Actualizaciones de contenido (texto, fotos) se editan directo en GitHub.

### Stack de desarrollo

- HTML/CSS estático o Astro (a definir en el plan de implementación)
- Sin base de datos ni backend
- Sin sistema de login para las señoras (el sitio es de solo lectura para los vecinos; solo el administrador lo actualiza)

---

## Email routing

| Dirección | Destino |
|---|---|
| contacto@barriodelcarmen.com.ar | email personal del administrador |

Configurado en Cloudflare Email Routing. Los registros MX son gestionados automáticamente por Cloudflare.

---

## Criterios de éxito

- Las 3 señoras pueden publicar en Facebook e Instagram desde su teléfono sin ayuda
- El sitio web carga en menos de 2 segundos
- El formulario de contacto envía el mensaje al administrador correctamente
- El dominio barriodelcarmen.com.ar resuelve al sitio en Cloudflare Pages
- Sin costos recurrentes de hosting

---

## Fuera de alcance

- Panel de administración web para las señoras (el sitio lo mantiene el administrador)
- Sistema de comentarios o foro en la web
- Tienda o pagos
- App móvil propia
