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

  const nombre = (body.nombre ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();
  if (!nombre || !mensaje || nombre.length > 100 || mensaje.length > 2000) {
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

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Brevo error', res.status, detail);
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
