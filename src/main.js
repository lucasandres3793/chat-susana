import { sendMessage, subscribe, getState } from './engine/chatEngine.js';
import { setMockMode } from './engine/mockApi.js';
import { render, showHint } from './ui.js';

// Cada cambio de estado del motor redibuja la pantalla
subscribe(render);
render(getState());

const form = document.querySelector('#composer');
const input = document.querySelector('#message-input');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const texto = input.value;
  input.value = '';   // se limpia enseguida: el mensaje ya aparece en la lista

  const resultado = await sendMessage(texto);

  if (resultado.reason === 'EMPTY') {
    showHint('Escribí algo antes de enviar.');
  }

  // Si fallo, se devuelve lo que habia escrito: no se pierde el mensaje
  if (!resultado.ok) {
    input.value = texto;
  }

  input.focus();
});

// Panel de desarrollo: cambia el comportamiento del mock
document.querySelector('#mock-mode').addEventListener('change', (event) => {
  setMockMode(event.target.value);
});
