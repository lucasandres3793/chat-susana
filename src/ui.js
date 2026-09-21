// Traduce el estado del motor a pantalla. Unica pieza que toca el DOM del chat.

const MENSAJES_DE_ERROR = {
  RATE_LIMIT: 'Susana esta desbordada. Espera un momento y volve a intentar.',
  EMPTY_RESPONSE: 'Susana no contesto nada. Proba de nuevo.',
  HTTP: 'Hubo un problema con el servidor. Intenta otra vez.',
  NETWORK: 'No se pudo conectar. Revisa tu conexion e intenta otra vez.',
};

export function getUserMessage(error) {
  return MENSAJES_DE_ERROR[error?.code] ?? MENSAJES_DE_ERROR.NETWORK;
}

export function render(state) {
  const lista = document.querySelector('#messages');

  // Guarda: el motor avisa siempre, pero si el usuario esta en Home o About
  // no hay chat en pantalla que actualizar.
  if (!lista) return;

  renderMessages(lista, state.messages);
  renderStatus(state);
  renderComposer(state.status);
  renderUsage(state.lastUsage);
}

function renderMessages(lista, messages) {
  lista.replaceChildren(...messages.map(crearMensaje));
  lista.scrollTop = lista.scrollHeight;   // scroll automatico al ultimo
}

function crearMensaje(message) {
  const item = document.createElement('li');
  item.className = `msg msg--${message.role}`;
  // textContent: ningun texto se interpreta como HTML
  item.textContent = message.truncated ? `${message.content}...` : message.content;
  return item;
}

function renderStatus(state) {
  const status = document.querySelector('#status');
  status.classList.remove('chat__status--error');

  if (state.status === 'loading') {
    status.textContent = 'Susana esta escribiendo...';
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

function renderUsage(usage) {
  document.querySelector('#usage').textContent = usage
    ? `Tokens: ${usage.input_tokens} entrada / ${usage.output_tokens} salida`
    : 'Tokens: -';
}

export function showHint(texto) {
  const status = document.querySelector('#status');
  if (!status) return;
  status.textContent = texto;
  status.classList.remove('hidden');
}
