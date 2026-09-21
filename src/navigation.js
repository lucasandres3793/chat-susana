import { navigateTo } from './router.js';

// Un solo listener en document atrapa los clics de todos los links,
// incluso los que las vistas dibujan despues.
export function setupLinkInterception() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Cmd, Ctrl, Shift o Alt: el usuario quiere otra pestaña o ventana
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isNewTab = link.target === '_blank';
    const isExternal = link.origin !== window.location.origin;

    if (isModified || isNewTab || isExternal) return;

    // Solo rutas absolutas de nuestra app: descarta mailto:, tel: y anclas
    if (!href.startsWith('/')) return;

    event.preventDefault();   // recien aca cancelamos la navegacion del navegador
    navigateTo(href);
  });
}
