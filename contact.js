document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const mensaje = document.getElementById('mensaje').value.trim();
  const status = document.getElementById('form-status');
  const btn = document.getElementById('submit-btn');

  if (!nombre || !email || !mensaje) {
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
      body: JSON.stringify({ nombre, email, mensaje }),
    });

    if (res.ok) {
      status.textContent = '¡Mensaje enviado! Te respondemos a la brevedad.';
      status.className = 'success';
      btn.textContent = 'Mensaje enviado';
      e.target.reset();
    } else {
      status.textContent = 'Hubo un error al enviar. Escribinos a contacto@barriodelcarmen.com.ar';
      status.className = 'error';
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
    }
  } catch {
    status.textContent = 'Sin conexión. Escribinos a contacto@barriodelcarmen.com.ar';
    status.className = 'error';
    btn.disabled = false;
    btn.textContent = 'Enviar mensaje';
  }
});
