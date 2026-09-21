import { router } from './router.js';
import { setupLinkInterception } from './navigation.js';
import { subscribe } from './engine/chatEngine.js';
import { render } from './ui.js';

// 1. El motor avisa cada cambio de estado. Se suscribe UNA sola vez, al arrancar.
//    Si el chat no esta en pantalla, render() se da cuenta solo y no hace nada.
subscribe(render);

// 2. Back/Forward: el navegador ya cambio la URL, solo hay que redibujar
window.addEventListener('popstate', () => {
  router();
});

// 3. Intercepcion de clics en links internos
setupLinkInterception();

// 4. Render inicial: dibuja la vista de la URL con la que entro el usuario
router();
