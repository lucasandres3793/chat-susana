// Traduce el estado del motor a pantalla. Es la unica pieza que toca el DOM.

// El motor habla en codigos; la UI decide como contarselo a una persona
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
  renderMessages(state.messages);
  renderStatus(state);
  renderComposer(state.status);
  renderUsage(state.lastUsage);
}

function renderMessages(messages) {
  const lista = document.querySelector('#messages');
  lista.replaceChildren(...messages.map(crearMensaje));
  lista.scrollTop = lista.scrollHeight;   // scroll automatico al ultimo mensaje
}

function crearMensaje(message) {
  const item = document.createElement('li');
  item.className = `msg msg--${message.role}`;
  // textContent: ningun texto, del usuario o del modelo, se interpreta como HTML
  item.textContent = message.truncated ? `${message.content}...` : message.content;
  return item;
}

function renderStatus(state) {
  const status = document.querySelector('#status');
  status.classList.remove('chat__status--error');

  if (state.status === 'loading') {
    status.textContent = 'Susana está escribiendo...';
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

// Bloqueo visual: mientras Susana contesta, no se puede escribir ni enviar
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
  status.textContent = texto;
  status.classList.remove('hidden');
}
