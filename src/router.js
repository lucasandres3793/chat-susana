import { homeView } from './views/home.js';
import { chatView } from './views/chat.js';
import { aboutView } from './views/about.js';
import { notFoundView } from './views/notFound.js';

// Tabla de rutas: cada URL apunta a su vista (sin ejecutar)
const routes = {
  '/home': homeView,
  '/chat': chatView,
  '/about': aboutView,
};

// Lee la URL y dibuja. No cambia la URL (salvo la redireccion de "/").
export function router() {
  // "/" no es una vista: replaceState redirige sin dejar entrada en el historial
  if (window.location.pathname === '/') {
    history.replaceState(null, '', '/home');
  }

  const view = routes[window.location.pathname] ?? notFoundView;
  const app = document.querySelector('#app');

  app.innerHTML = view.render();   // 1. el HTML
  if (view.init) view.init();      // 2. los listeners, solo si la vista los necesita

  updateActiveLink();
}

// Marca en el nav la ruta actual
function updateActiveLink() {
  document.querySelectorAll('.nav a').forEach((link) => {
    const activo = link.pathname === window.location.pathname;
    link.classList.toggle('is-active', activo);
    if (activo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// Cambia la URL y dibuja. Unica puerta de entrada a la navegacion.
export function navigateTo(path) {
  // Ya estamos ahi: no duplicamos la entrada en el historial
  if (window.location.pathname === path) return;

  history.pushState(null, '', path);
  router();   // pushState no dispara popstate: hay que llamar a router a mano
}
