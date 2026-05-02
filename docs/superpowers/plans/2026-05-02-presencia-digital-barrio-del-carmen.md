# Presencia Digital Barrio del Carmen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el sitio web institucional de la Comisión Vecinal en barriodelcarmen.com.ar con formulario de contacto funcional vía Brevo.

**Architecture:** Sitio estático (HTML + CSS + JS vanilla) hosteado en Cloudflare Pages, conectado al repo de GitHub para deploy automático. El formulario de contacto usa una Cloudflare Pages Function para llamar a la API de Brevo server-side (la API key nunca queda expuesta en el frontend).

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, Cloudflare Pages, Cloudflare Pages Functions, Brevo API v3.

---

## Estructura de archivos

```
barrio-del-carmen-azul/
├── index.html              # Página principal (único HTML)
├── styles.css              # Todos los estilos
├── contact.js              # Handler del formulario (fetch a /contact)
└── functions/
    └── contact.js          # Cloudflare Pages Function (llama a Brevo)
```

---

## Task 1: Conectar Cloudflare Pages al repo de GitHub

**Files:** ninguno (configuración en el dashboard de Cloudflare)

- [ ] **Step 1: Crear proyecto en Cloudflare Pages**

  1. Ir a dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
  2. Seleccionar el repo `barrio-del-carmen-azul`
  3. Branch: `main`
  4. Build settings: dejar todo en blanco (sitio estático, sin build command)
  5. Hacer click en Save and Deploy

- [ ] **Step 2: Verificar deploy inicial**

  Cloudflare genera una URL del tipo `barrio-del-carmen-azul.pages.dev`. Abrirla en el browser — debe mostrar el README o página vacía (es correcto, aún no hay index.html).

- [ ] **Step 3: Agregar dominio personalizado**

  En el proyecto de Pages → Custom domains → Add a custom domain:
  - Dominio: `barriodelcarmen.com.ar`
  - Cloudflare detecta automáticamente el DNS (ya controla los nameservers) y agrega el registro CNAME
  - Esperar ~1 minuto para que el SSL se provisione automáticamente

---

## Task 2: Verificar dominio de sender en Brevo

**Files:** ninguno (configuración en Brevo + DNS records en Cloudflare)

Antes de implementar el formulario, el dominio sender debe estar verificado en Brevo para que los emails no caigan en spam.

- [ ] **Step 1: Iniciar verificación de dominio en Brevo**

  1. Ir a brevo.com → Senders & IPs → Domains → Add a domain
  2. Ingresar `barriodelcarmen.com.ar`
  3. Brevo muestra 3 registros DNS a agregar (DKIM, DMARC y un registro de verificación)

- [ ] **Step 2: Agregar los registros DNS en Cloudflare**

  En Cloudflare Dashboard → DNS → Records → Add record. Agregar los 3 registros que indica Brevo (son del tipo TXT y/o CNAME). Ejemplo típico:

  | Type | Name | Content |
  |------|------|---------|
  | TXT | `mail._domainkey` | `v=DKIM1; k=rsa; p=<clave-que-da-brevo>` |
  | TXT | `@` | `v=spf1 include:sendinblue.com ~all` |
  | TXT | `_dmarc` | `v=DMARC1; p=none;` |

- [ ] **Step 3: Verificar en Brevo**

  Volver a Brevo → Domains → hacer click en "Verify" junto al dominio. Puede tardar hasta 10 minutos en propagar. El estado debe cambiar a "Verified".

---

## Task 3: Cloudflare Pages Function para formulario

**Files:**
- Crear: `functions/contact.js`

- [ ] **Step 1: Crear el archivo de la función**

  ```javascript
  export async function onRequestPost(context) {
    let body;
    try {
      body = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'invalid body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { nombre, mensaje } = body;
    if (!nombre || !mensaje) {
      return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': context.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Web Barrio del Carmen', email: 'contacto@barriodelcarmen.com.ar' },
        to: [{ email: 'contacto@barriodelcarmen.com.ar' }],
        subject: `Mensaje de ${nombre} — Web Barrio del Carmen`,
        textContent: `Nombre: ${nombre}\n\n${mensaje}`,
      }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'brevo error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  ```

- [ ] **Step 2: Agregar la variable de entorno BREVO_API_KEY en Cloudflare Pages**

  Cloudflare Pages Dashboard → proyecto → Settings → Environment variables → Add variable:
  - Variable name: `BREVO_API_KEY`
  - Value: el API key de Brevo (el que está en tu cuenta de Brevo — generá uno nuevo si revocaste el anterior)
  - Aplicar a: Production y Preview

  Hacer un nuevo deploy para que la variable tome efecto (basta con hacer un push vacío o ir a Deployments → Retry deployment).

- [ ] **Step 3: Commit**

  ```bash
  git add functions/contact.js
  git commit -m "feat: agregar Cloudflare Pages Function para formulario de contacto"
  git push
  ```

---

## Task 4: HTML del sitio

**Files:**
- Crear: `index.html`

- [ ] **Step 1: Crear index.html**

  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Comisión Vecinal del Barrio del Carmen, Azul. Eventos, noticias y actividades de nuestra comunidad.">
    <title>Barrio del Carmen · Azul</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <header>
      <div class="container">
        <h1>Comisión Vecinal<br><span>Barrio del Carmen</span></h1>
        <p class="subtitle">Azul, Buenos Aires</p>
      </div>
    </header>

    <main>

      <section id="quienes-somos" class="section">
        <div class="container">
          <h2>Quiénes somos</h2>
          <p>Somos el grupo de vecinos que organiza y cuida el Barrio del Carmen en Azul. Acá encontrás eventos, noticias y todo lo que pasa en el barrio.</p>
        </div>
      </section>

      <section id="que-hacemos" class="section section--alt">
        <div class="container">
          <h2>Qué hacemos</h2>
          <ul class="activities">
            <li>Organizamos eventos y actividades para el barrio</li>
            <li>Informamos sobre novedades y obras en la zona</li>
            <li>Coordinamos con el municipio mejoras para la comunidad</li>
            <li>Mantenemos conectados a los vecinos del barrio</li>
          </ul>
        </div>
      </section>

      <section id="donde-estamos" class="section">
        <div class="container">
          <h2>Dónde estamos</h2>
          <div class="map-wrapper">
            <iframe
              title="Mapa Barrio del Carmen, Azul"
              src="https://www.google.com/maps?q=barrio+del+carmen+azul+buenos+aires&output=embed"
              width="100%"
              height="350"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>

      <section id="contacto" class="section section--alt">
        <div class="container">
          <h2>Contacto</h2>
          <p>Escribinos y te respondemos a la brevedad.</p>
          <form id="contact-form" novalidate>
            <div class="field">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" required>
            </div>
            <div class="field">
              <label for="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" placeholder="¿En qué te podemos ayudar?" rows="5" required></textarea>
            </div>
            <button type="submit" id="submit-btn">Enviar mensaje</button>
            <p id="form-status" role="status" aria-live="polite"></p>
          </form>
          <p class="contact-email">O escribinos directamente a <a href="mailto:contacto@barriodelcarmen.com.ar">contacto@barriodelcarmen.com.ar</a></p>
        </div>
      </section>

    </main>

    <footer>
      <div class="container">
        <p>Comisión Vecinal Barrio del Carmen · Azul, Buenos Aires</p>
        <p><a href="mailto:contacto@barriodelcarmen.com.ar">contacto@barriodelcarmen.com.ar</a></p>
      </div>
    </footer>

    <script src="contact.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add index.html
  git commit -m "feat: agregar estructura HTML del sitio"
  git push
  ```

- [ ] **Step 3: Verificar deploy**

  Esperar ~30 segundos, luego abrir `https://barrio-del-carmen-azul.pages.dev` en el browser. Debe mostrarse el HTML con las secciones (sin estilos todavía, eso es correcto).

---

## Task 5: CSS del sitio

**Files:**
- Crear: `styles.css`

- [ ] **Step 1: Crear styles.css**

  ```css
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --azul: #1a4a7a;
    --azul-claro: #2d6db5;
    --fondo: #f8f7f4;
    --fondo-alt: #ffffff;
    --texto: #1a1a2e;
    --texto-suave: #5a5a72;
    --borde: #d0d5e0;
    --radio: 8px;
    --sombra: 0 2px 12px rgba(0,0,0,0.08);
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--fondo);
    color: var(--texto);
    line-height: 1.7;
    font-size: 1rem;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 1.25rem;
  }

  /* Header */
  header {
    background: var(--azul);
    color: white;
    padding: 3.5rem 0 3rem;
    text-align: center;
  }

  header h1 {
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  header h1 span {
    color: #a8c8f0;
  }

  .subtitle {
    margin-top: 0.75rem;
    font-size: 1.1rem;
    color: #c8ddf0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Sections */
  .section {
    padding: 3.5rem 0;
    background: var(--fondo);
  }

  .section--alt {
    background: var(--fondo-alt);
  }

  .section h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--azul);
    margin-bottom: 1rem;
  }

  .section p {
    color: var(--texto-suave);
    font-size: 1.05rem;
  }

  /* Activities list */
  .activities {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .activities li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    color: var(--texto-suave);
    font-size: 1.05rem;
  }

  .activities li::before {
    content: '✓';
    color: var(--azul-claro);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  /* Map */
  .map-wrapper {
    margin-top: 1.25rem;
    border-radius: var(--radio);
    overflow: hidden;
    box-shadow: var(--sombra);
    border: 1px solid var(--borde);
  }

  .map-wrapper iframe {
    display: block;
  }

  /* Contact form */
  #contact-form {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .field label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--texto);
  }

  .field input,
  .field textarea {
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--borde);
    border-radius: var(--radio);
    font-family: inherit;
    font-size: 1rem;
    color: var(--texto);
    background: var(--fondo);
    transition: border-color 0.2s;
    resize: vertical;
  }

  .field input:focus,
  .field textarea:focus {
    outline: none;
    border-color: var(--azul-claro);
  }

  button[type="submit"] {
    align-self: flex-start;
    background: var(--azul);
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: var(--radio);
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  button[type="submit"]:hover {
    background: var(--azul-claro);
  }

  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  #form-status {
    font-size: 0.95rem;
    min-height: 1.4rem;
    color: var(--texto-suave);
  }

  #form-status.success {
    color: #2d7a4a;
  }

  #form-status.error {
    color: #b03030;
  }

  .contact-email {
    margin-top: 1.5rem;
    font-size: 0.95rem;
  }

  .contact-email a {
    color: var(--azul-claro);
    text-decoration: none;
  }

  .contact-email a:hover {
    text-decoration: underline;
  }

  /* Footer */
  footer {
    background: var(--azul);
    color: #c8ddf0;
    text-align: center;
    padding: 2rem 0;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  footer a {
    color: #a8c8f0;
    text-decoration: none;
  }

  footer a:hover {
    text-decoration: underline;
  }

  footer .container {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  @media (max-width: 480px) {
    button[type="submit"] {
      align-self: stretch;
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add styles.css
  git commit -m "feat: agregar estilos del sitio"
  git push
  ```

- [ ] **Step 3: Verificar en browser**

  Abrir `https://barrio-del-carmen-azul.pages.dev` — debe verse el sitio con diseño completo, colores azul, secciones bien separadas y mapa embebido.

---

## Task 6: JavaScript del formulario de contacto

**Files:**
- Crear: `contact.js`

- [ ] **Step 1: Crear contact.js**

  ```javascript
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    const status = document.getElementById('form-status');
    const btn = document.getElementById('submit-btn');

    if (!nombre || !mensaje) {
      status.textContent = 'Por favor completá todos los campos.';
      status.className = 'error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    status.textContent = '';
    status.className = '';

    try {
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, mensaje }),
      });

      if (res.ok) {
        status.textContent = '¡Mensaje enviado! Te respondemos a la brevedad.';
        status.className = 'success';
        e.target.reset();
      } else {
        status.textContent = 'Hubo un error al enviar. Escribinos a contacto@barriodelcarmen.com.ar';
        status.className = 'error';
      }
    } catch {
      status.textContent = 'Sin conexión. Escribinos a contacto@barriodelcarmen.com.ar';
      status.className = 'error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
    }
  });
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add contact.js
  git commit -m "feat: agregar handler del formulario de contacto"
  git push
  ```

- [ ] **Step 3: Verificar formulario end-to-end**

  1. Abrir `https://barriodelcarmen.com.ar`
  2. Completar el formulario con un nombre y mensaje de prueba
  3. Hacer click en "Enviar mensaje"
  4. Verificar que aparece el mensaje de éxito en verde
  5. Verificar que llega el email a `contacto@barriodelcarmen.com.ar`

  Si el email no llega: revisar que el dominio esté verificado en Brevo (Task 2) y que la variable `BREVO_API_KEY` esté cargada en Cloudflare Pages.

---

## Task 7: Redes sociales (pasos manuales)

No involucra código. Son pasos manuales en Facebook e Instagram.

- [ ] **Step 1: Crear cuenta de Gmail para la comisión**

  Crear `comisionbarriodelcarmen@gmail.com` (o similar disponible). Esta cuenta se usa solo para registrar cuentas en redes sociales, no para emails del barrio.

- [ ] **Step 2: Crear Facebook Page**

  1. Ir a facebook.com/pages/create con la cuenta personal del administrador
  2. Nombre: `Comisión Vecinal Barrio del Carmen - Azul`
  3. Categoría: `Organización comunitaria`
  4. Descripción: `Somos el grupo de vecinos que organiza y cuida el Barrio del Carmen en Azul. Acá encontrás eventos, noticias y todo lo que pasa en el barrio.`
  5. Email: `contacto@barriodelcarmen.com.ar`
  6. Sitio web: `https://barriodelcarmen.com.ar`
  7. Ciudad: Azul, Buenos Aires

- [ ] **Step 3: Crear cuenta de Instagram Business**

  1. Ir a instagram.com → Crear cuenta nueva con `comisionbarriodelcarmen@gmail.com`
  2. Username sugerido: `@barriodelcarmenazul`
  3. Ir a Configuración → Tipo de cuenta → Cambiar a cuenta profesional → Empresa
  4. Vincular a la Facebook Page creada en Step 2

- [ ] **Step 4: Agregar editoras en Facebook Page**

  Para cada señora que tenga cuenta personal de Facebook:
  1. Ir a la Page → Configuración → Roles de página
  2. Escribir el nombre o email de su cuenta de Facebook
  3. Seleccionar rol: **Editor**
  4. Guardar — les llega una notificación para aceptar

- [ ] **Step 5: Instalar Meta Business Suite**

  Cada señora descarga la app **Meta Business Suite** de la App Store o Google Play e inicia sesión con su cuenta personal de Facebook. La app muestra la Page de la comisión y permite publicar en Facebook e Instagram simultáneamente.
