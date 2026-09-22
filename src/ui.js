// Traduce el estado del motor a pantalla. Única pieza que toca el DOM del chat.

const MENSAJES_DE_ERROR = {
  RATE_LIMIT: 'Susana está desbordada. Esperá un momento y volvé a intentar.',
  EMPTY_RESPONSE: 'Susana no contestó nada. Probá de nuevo.',
  HTTP: 'Hubo un problema con el servidor. Intentá otra vez.',
  NETWORK: 'No se pudo conectar. Revisá tu conexión e intentá otra vez.',
};

export function getUserMessage(error) {
  return MENSAJES_DE_ERROR[error?.code] ?? MENSAJES_DE_ERROR.NETWORK;
}

export function render(state) {
  const lista = document.querySelector('#messages');

  // Guarda: el motor avisa siempre, pero si el usuario está en Home o About
  // no hay chat en pantalla que actualizar.
  if (!lista) return;

  renderMessages(lista, state.messages);
  renderStatus(state);
  renderComposer(state.status);
}

function renderMessages(lista, messages) {
  lista.replaceChildren(...messages.map(crearMensaje));
  lista.scrollTop = lista.scrollHeight;   // scroll automático al último
}

function crearMensaje(message) {
  const item = document.createElement('li');
  item.className = `msg msg--${message.role}`;
  // textContent: ningún texto se interpreta como HTML
  item.textContent = message.truncated ? `${message.content}...` : message.content;
  return item;
}

function renderStatus(state) {
  const status = document.querySelector('#status');
  status.classList.remove('chat__status--error', 'chat__status--typing');

  if (state.status === 'loading') {
    status.textContent = 'Susana está escribiendo';
    status.classList.add('chat__status--typing');   // los puntos los pone el CSS
  } else if (state.status === 'retrying') {
    status.textContent = `Demasiados mensajes seguidos. Reintento en ${state.retryIn} s...`;
  } else if (state.status === 'error') {
    status.textContent = getUserMessage(state.error);
    status.classList.add('chat__status--error');
  } else {
    status.classList.add('hidden');
    return;
  }

  status.classList.remove('hidden');
}

function renderComposer(status) {
  const ocupado = status === 'loading' || status === 'retrying';
  document.querySelector('#message-input').disabled = ocupado;
  document.querySelector('#send-btn').disabled = ocupado;
}

export function showHint(texto) {
  const status = document.querySelector('#status');
  if (!status) return;
  status.textContent = texto;
  status.classList.remove('hidden');
}
