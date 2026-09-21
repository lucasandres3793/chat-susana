import { getState, sendMessage } from '../engine/chatEngine.js';
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
    </section>
  `,

  // Corre despues de que el HTML esta en el DOM
  init: () => {
    // Redibuja la conversacion que ya vive en el motor
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

      if (!resultado.ok) {
        input.value = texto;
      }

      input.focus();
    });

    input.focus();
  },
};
