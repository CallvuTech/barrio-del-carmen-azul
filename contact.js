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
