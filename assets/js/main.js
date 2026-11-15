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

// Validación y mensajes del formulario de contacto.
const form = document.querySelector('#formulario-contacto');
if (form) {
  const status = document.querySelector('#estado-formulario');
  // El navegador comprueba required, type, pattern y los límites del HTML antes de submit.
  form.addEventListener('submit', event => {
    event.preventDefault();
    // El navegador ejecuta primero las validaciones HTML5. No se envían ni guardan datos.
    status.textContent = 'Formulario validado. La información ingresada no se envió ni se guardó.';
    status.focus();
  });
  // Limpia el resultado de la validación al restablecer el formulario.
  form.addEventListener('reset', () => { status.textContent = ''; });
  // Habilita el botón después de registrar el manejador de validación.
  form.querySelector('button[type=submit]').disabled = false;
}
