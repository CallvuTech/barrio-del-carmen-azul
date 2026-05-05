export async function onRequestPost(context) {
  if (!context.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not configured');
    return new Response(JSON.stringify({ ok: false, error: 'server misconfiguration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot: bots fill hidden fields, humans don't
  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nombre = (body.nombre ?? '').trim();
  const email = (body.email ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();

  if (!nombre || !email || !mensaje ||
      nombre.length > 100 || email.length > 200 || !email.includes('@') ||
      mensaje.length > 2000) {
    return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let res;
  try {
    res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': context.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Web Barrio del Carmen', email: 'contacto@barriodelcarmen.com.ar' },
        to: [{ email: 'contacto@barriodelcarmen.com.ar' }],
        replyTo: { email, name: nombre },
        subject: `Mensaje de ${nombre} — Web Barrio del Carmen`,
        textContent: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
      }),
    });
  } catch (err) {
    console.error('Brevo unreachable', err);
    return new Response(JSON.stringify({ ok: false, error: 'brevo unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!res.ok) {
    console.error('Brevo error', res.status);
    return new Response(JSON.stringify({ ok: false, error: 'brevo error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
