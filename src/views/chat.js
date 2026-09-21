import { getState, sendMessage } from '../engine/chatEngine.js';
import { setMockMode } from '../engine/mockApi.js';
import { render, showHint } from '../ui.js';

export const chatView = {
  render: () => `
    <section class="chat">
      <header class="chat__header">
        <h1>Susana de Musicardi</h1>
        <p>Esperando la carroza (1985)</p>
      </header>

      <ol id="messages" class="chat__messages" aria-live="polite"></ol>

      <p id="status" class="chat__status hidden"></p>

      <form id="composer" class="chat__composer">
        <input id="message-input" type="text" placeholder="Escribile a Susana..." autocomplete="off">
        <button id="send-btn" type="submit">Enviar</button>
      </form>

      <!-- Solo para desarrollo: se elimina antes de desplegar -->
      <section class="dev-panel">
        <label>
          Modo del mock
          <select id="mock-mode">
            <option value="ok">Respuesta normal</option>
            <option value="429-once">429 una vez</option>
            <option value="429-always">429 siempre</option>
            <option value="multi">content con varios bloques</option>
          </select>
        </label>
        <p id="usage">Tokens: -</p>
      </section>
    </section>
  `,

  // Corre despues de que el HTML esta en el DOM
  init: () => {
    // Redibuja la conversacion que ya vive en el motor:
    // asi volver de About no borra lo charlado
    render(getState());

    const form = document.querySelector('#composer');
    const input = document.querySelector('#message-input');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const texto = input.value;
      input.value = '';

      const resultado = await sendMessage(texto);

      if (resultado.reason === 'EMPTY') {
        showHint('Escribi algo antes de enviar.');
      }

      // Si fallo, devolvemos lo escrito: no se pierde el mensaje
      if (!resultado.ok) {
        input.value = texto;
      }

      input.focus();
    });

    document.querySelector('#mock-mode').addEventListener('change', (event) => {
      setMockMode(event.target.value);
    });

    input.focus();
  },
};
