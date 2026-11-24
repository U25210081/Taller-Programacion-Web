// Interacciones compartidas de navegación y formulario.
'use strict';
// Convierte los elementos data-lucide del HTML en iconos SVG.
if (window.lucide) window.lucide.createIcons();
// Controles del menú móvil, coordinados con el punto de cambio de 992 px en CSS.
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-menu');
const mobileQuery = window.matchMedia('(max-width: 992px)');
// Cierra el menú y permite devolver el foco al botón al pulsar Escape.
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  menu.classList.remove('abierto');
  if (returnFocus) menuButton.focus();
}
// Activa los estilos del menú controlado con JavaScript.
document.documentElement.classList.add('js');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  // CSS alterna los iconos menu y x según el atributo aria-expanded.
  menu.classList.toggle('abierto', open);
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
// Cierre accesible del menú mediante la tecla Escape.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.encabezado')) closeMenu();
});
mobileQuery.addEventListener('change', () => closeMenu());

// Retorno al inicio. El botón aparece al superar 300 píxeles de desplazamiento.
const upButton = document.querySelector('.scroll-up');
function updateUpButton() { upButton.hidden = window.scrollY <= 300; }
window.addEventListener('scroll', updateUpButton, { passive: true });
window.addEventListener('pageshow', updateUpButton);
updateUpButton();
upButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  // Evita perder el foco cuando el botón vuelva a ocultarse.
  const logo = document.querySelector('.marca a');
  logo.focus({ preventScroll: true });
});

// Guarda el plan elegido sin cambiar el enlace al formulario.
const planValues = new Map([
  ['Plan Básico', 'basico'],
  ['Plan Estándar', 'estandar'],
  ['Plan Premium', 'premium'],
]);
document.querySelectorAll('.plan a').forEach(link => {
  link.addEventListener('click', () => {
    const title = link.closest('.plan').querySelector('h3').textContent.trim();
    const value = planValues.get(title);
    if (value) {
      try {
        sessionStorage.setItem('planElegido', value);
      } catch {
        // El enlace funciona aunque el almacenamiento esté bloqueado.
      }
    }
  });
});

// Preselecciona el plan y ajusta la disponibilidad del horario nocturno.
const planSelect = document.querySelector('#plan');
if (planSelect) {
  try {
    const savedPlan = sessionStorage.getItem('planElegido');
    if (Array.from(planSelect.options).some(option => option.value === savedPlan)) {
      planSelect.value = savedPlan;
    }
  } catch {
    // El visitante puede elegir el plan manualmente.
  }

  const night = document.querySelector('#noche');
  const basicNote = document.querySelector('#nota-plan-basico');
  function updateSchedule() {
    const isBasic = planSelect.value === 'basico';
    night.disabled = isBasic;
    if (isBasic) night.checked = false;
    basicNote.hidden = !isBasic;
  }

  updateSchedule();
  planSelect.addEventListener('change', updateSchedule);
  // Espera a que el formulario restablezca los valores de los campos.
  planSelect.form.addEventListener('reset', () => setTimeout(updateSchedule, 0));
  window.addEventListener('pageshow', updateSchedule);
}

// Validación y mensajes del formulario de contacto.
const form = document.querySelector('#formulario-contacto');
if (form) {
  const status = document.querySelector('#estado-formulario');
  const requiredMessages = {
    nombre: 'Escribe tus nombres y apellidos.',
    correo: 'Escribe tu correo electrónico.',
    asunto: 'Escribe el asunto de tu consulta.',
    telefono: 'Escribe tu número de teléfono.',
    edad: 'Escribe tu edad.',
    plan: 'Selecciona un plan.',
    manana: 'Selecciona un horario.',
    mensaje: 'Escribe tu consulta.',
    terminos: 'Marca la casilla para confirmar que revisaste los campos.',
  };
  const errors = new Map();
  const schedule = form.querySelector('.opciones');
  const firstScheduleOption = form.querySelector('#manana');
  let firstInvalid;

  // Usa las restricciones del HTML para mostrar mensajes en español.
  function validationMessage(field) {
    const validity = field.validity;
    if (validity.badInput) return 'Ingresa tu edad en números.';
    if (validity.valueMissing) return requiredMessages[field.id];
    if (validity.typeMismatch) return 'Escribe un correo con formato nombre@correo.com.';
    if (validity.patternMismatch) return 'Ingresa un teléfono de 9 dígitos.';
    if (validity.rangeUnderflow || validity.rangeOverflow || validity.stepMismatch) {
      return 'Ingresa una edad entera entre 16 y 80 años.';
    }
    if (validity.tooShort) return `Escribe al menos ${field.minLength} caracteres.`;
    if (validity.tooLong) return `Escribe como máximo ${field.maxLength} caracteres.`;
    return 'Revisa el valor de este campo.';
  }

  function clearError(field) {
    const error = errors.get(field);
    error.remove();
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    errors.delete(field);
  }

  // Agrupa la validación de los radios en un solo mensaje.
  function validationField(field) {
    return schedule.contains(field) ? firstScheduleOption : field;
  }

  // Sustituye el aviso flotante por un mensaje junto al campo o al grupo.
  form.addEventListener('invalid', event => {
    event.preventDefault();
    const field = validationField(event.target);
    let error = errors.get(field);
    if (!error) {
      const container = field.closest('.opciones, .aceptacion') || field;
      error = document.createElement('p');
      error.id = `error-${field.id}`;
      error.className = 'campo-error';
      container.after(error);
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', error.id);
      errors.set(field, error);
    }
    error.textContent = validationMessage(field);
    status.textContent = '';
    if (!firstInvalid) {
      firstInvalid = field;
      queueMicrotask(() => {
        firstInvalid.focus();
        firstInvalid = null;
      });
    }
  }, true);

  // Actualiza los avisos al corregir los campos que ya tienen un error.
  form.addEventListener('input', event => {
    const field = validationField(event.target);
    if (!errors.has(field)) return;
    if (field.validity.valid) {
      clearError(field);
    } else {
      errors.get(field).textContent = validationMessage(field);
    }
  });

  // El navegador comprueba required, type, pattern y los límites del HTML antes de submit.
  form.addEventListener('submit', event => {
    event.preventDefault();
    // El navegador ejecuta primero las validaciones HTML5. No se envían ni guardan datos.
    // Reutiliza los enlaces de los canales de atención y sus atributos.
    const whatsapp = document.querySelector('#canales a[href^="https://wa.me/"]').cloneNode(true);
    const phone = document.querySelector('#canales a[href^="tel:"]').cloneNode(true);
    const email = document.querySelector('#canales a[href^="mailto:"]').cloneNode(true);
    phone.textContent = 'teléfono';
    email.textContent = 'correo';
    status.replaceChildren(
      'Tus datos se validaron correctamente. Para enviar tu solicitud, contáctanos por ',
      whatsapp, ', ', phone, ' o ', email, '.'
    );
    status.focus();
  });
  // Limpia el resultado de la validación al restablecer el formulario.
  form.addEventListener('reset', () => {
    status.textContent = '';
    for (const field of errors.keys()) clearError(field);
  });
  // Habilita el botón después de registrar el manejador de validación.
  form.querySelector('button[type=submit]').disabled = false;
}
